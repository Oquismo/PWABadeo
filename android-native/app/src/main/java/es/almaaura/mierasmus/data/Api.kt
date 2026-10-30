package es.almaaura.mierasmus.data

import android.content.Context
import android.content.SharedPreferences
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.ZonedDateTime

class AuthExpired : Exception("Sesión caducada")
class ApiError(msg: String) : Exception(msg)

data class User(
    val id: Int, val email: String, val firstName: String?, val lastName: String?, val name: String?,
    val role: String, val age: Int?, val schoolId: Int?, val schoolName: String?, val avatarUrl: String?,
    val city: String?, val country: String?, val arrival: String?, val departure: String?,
) {
    val displayName get() = firstName ?: name?.substringBefore(' ') ?: email.substringBefore('@')
    val fullName get() = listOfNotNull(firstName, lastName).joinToString(" ").ifBlank { name ?: email }
    companion object {
        fun from(o: JSONObject) = User(
            o.getInt("id"), o.getString("email"), o.str("firstName"), o.str("lastName"), o.str("name"),
            o.optString("role", "user"), if (o.isNull("age")) null else o.optInt("age"),
            if (o.isNull("schoolId")) null else o.optInt("schoolId"),
            o.optJSONObject("school")?.str("name"), o.str("avatarUrl"), o.str("city"), o.str("country"),
            o.str("arrivalDate"), o.str("departureDate"),
        )
    }
}

data class ProgramEvent(val id: Int, val title: String, val start: ZonedDateTime, val end: ZonedDateTime?, val location: String?, val who: String?, val allDay: Boolean)
data class CommunityEvent(val id: String, val title: String, val date: ZonedDateTime, val isPublic: Boolean)
data class Announcement(val id: Int, val message: String, val createdAt: ZonedDateTime?, val by: String?)
data class Photo(val id: Int, val url: String, val thumb: String?, val caption: String?, val author: String)
data class Question(val id: Int, val title: String, val content: String, val author: String, val answers: Int, val resolved: Boolean)
data class Place(val name: String, val address: String?, val rating: Double?, val image: String?, val url: String?)

val Madrid: ZoneId = ZoneId.of("Europe/Madrid")
private fun JSONObject.str(k: String): String? = if (isNull(k) || !has(k)) null else optString(k).ifBlank { null }
private fun parseDate(s: String?): ZonedDateTime? = s?.let { runCatching { Instant.parse(it).atZone(Madrid) }.getOrNull() }
private inline fun <T> JSONArray.map(f: (JSONObject) -> T): List<T> = (0 until length()).map { f(getJSONObject(it)) }

/** Cliente de la API de Next.js (https://pwa-badeo.vercel.app). Autenticación por cookies. */
object Api {
    const val BASE = "https://pwa-badeo.vercel.app"
    private lateinit var prefs: SharedPreferences

    fun init(ctx: Context) { prefs = ctx.getSharedPreferences("session", Context.MODE_PRIVATE) }

    val user: User?
        get() = prefs.getString("user", null)?.let { runCatching { User.from(JSONObject(it)) }.getOrNull() }

    private fun saveUser(o: JSONObject) { prefs.edit().putString("user", o.toString()).apply() }
    fun clear() = prefs.edit().clear().apply()

    // ---------- HTTP ----------
    private fun cookieHeader(): String = listOfNotNull(
        prefs.getString("auth-token", null)?.let { "auth-token=$it" },
        prefs.getString("refresh-token", null)?.let { "refresh-token=$it" },
    ).joinToString("; ")

    private fun storeCookies(c: HttpURLConnection) {
        c.headerFields["Set-Cookie"]?.forEach { raw ->
            val (k, v) = raw.substringBefore(';').split('=', limit = 2).let { it[0].trim() to it.getOrElse(1) { "" } }
            if (k == "auth-token" || k == "refresh-token") prefs.edit().apply { if (v.isEmpty()) remove(k) else putString(k, v) }.apply()
        }
    }

    private fun raw(method: String, path: String, body: JSONObject?, timeoutMs: Int = 20000): Pair<Int, String> {
        val c = URL(BASE + path).openConnection() as HttpURLConnection
        c.requestMethod = method
        c.instanceFollowRedirects = false
        c.connectTimeout = 15000; c.readTimeout = timeoutMs
        c.setRequestProperty("Accept", "application/json")
        // Algunas rutas (p. ej. /api/user-events) identifican al usuario por esta cabecera, igual que la web.
        prefs.getString("user", null)?.let { runCatching { JSONObject(it).getInt("id") }.getOrNull() }?.let { c.setRequestProperty("x-user-id", it.toString()) }
        cookieHeader().takeIf { it.isNotEmpty() }?.let { c.setRequestProperty("Cookie", it) }
        if (body != null) {
            c.doOutput = true
            c.setRequestProperty("Content-Type", "application/json")
            c.outputStream.use { it.write(body.toString().toByteArray()) }
        }
        val code = c.responseCode
        storeCookies(c)
        val text = (if (code < 400) c.inputStream else c.errorStream)?.bufferedReader()?.use { it.readText() } ?: ""
        c.disconnect()
        return code to text
    }

    private suspend fun call(method: String, path: String, body: JSONObject? = null, retry: Boolean = true, timeoutMs: Int = 20000): JSONObject = withContext(Dispatchers.IO) {
        val (code, text) = raw(method, path, body, timeoutMs)
        if (path.startsWith("/api/auth/login") && code >= 400)
            throw ApiError(runCatching { JSONObject(text).optString("error") }.getOrNull()?.ifBlank { null } ?: "Error $code")
        // Solo es sesión caducada si el middleware redirige o rechaza el token; otros 401 son errores de la ruta.
        val sessionError = code in 300..399 || (code == 401 && text.contains("Token"))
        if (sessionError && retry) {
            val (rc, _) = raw("POST", "/api/auth/refresh", null)
            if (rc in 200..299) return@withContext call(method, path, body, retry = false, timeoutMs = timeoutMs)
            throw AuthExpired()
        }
        if (sessionError) throw AuthExpired()
        val json = runCatching { JSONObject(text) }.getOrElse { JSONObject() }
        if (code >= 400) throw ApiError(json.optString("error", "Error $code"))
        json
    }

    // ---------- Auth ----------
    suspend fun login(email: String, password: String): User {
        val r = call("POST", "/api/auth/login-retry", JSONObject().put("email", email.trim()).put("password", password), retry = false)
        val u = r.optJSONObject("user") ?: throw ApiError(r.optString("error", "Error al iniciar sesión"))
        saveUser(u); return user!!
    }

    suspend fun logout() { runCatching { call("POST", "/api/auth/logout", retry = false) }; clear() }

    suspend fun updateUser(firstName: String, age: String, city: String, country: String): User {
        val u = user ?: throw AuthExpired()
        val body = JSONObject().put("userId", u.id).put("name", firstName).put("age", age).put("city", city).put("country", country)
        val r = call("PUT", "/api/user/update", body)
        r.optJSONObject("user")?.let { saveUser(it) }
        return user!!
    }

    // ---------- Programa ----------
    suspend fun schoolEvents(from: LocalDate, to: LocalDate): List<ProgramEvent> {
        val sid = user?.schoolId ?: return emptyList()
        val f = from.atStartOfDay(Madrid).toInstant(); val t = to.plusDays(1).atStartOfDay(Madrid).toInstant()
        return call("GET", "/api/schools/$sid/events?from=$f&to=$t").optJSONArray("events")?.map {
            ProgramEvent(it.getInt("id"), it.getString("title"), parseDate(it.str("date"))!!, parseDate(it.str("endDate")), it.str("location"), it.str("who"), it.optBoolean("isAllDay"))
        } ?: emptyList()
    }

    // ---------- Eventos de la comunidad ----------
    suspend fun communityEvents(): List<CommunityEvent> =
        call("GET", "/api/user-events").optJSONArray("events")?.map {
            CommunityEvent(it.getString("id"), it.getString("title"), parseDate(it.str("date")) ?: ZonedDateTime.now(Madrid), it.optBoolean("isPublic"))
        } ?: emptyList()

    suspend fun createEvent(title: String, date: ZonedDateTime) {
        call("POST", "/api/user-events", JSONObject().put("title", title).put("date", date.toInstant().toString()).put("type", "community").put("isPublic", true))
    }

    // ---------- Avisos ----------
    suspend fun announcement(): Announcement? {
        val r = call("GET", "/api/announcement")
        if (r.isNull("message")) return null
        return Announcement(r.optInt("id"), r.getString("message"), parseDate(r.str("createdAt")), r.str("createdBy"))
    }

    // ---------- Álbum ----------
    suspend fun photos(): List<Photo> {
        val sid = user?.schoolId
        return call("GET", "/api/photos" + (sid?.let { "?schoolId=$it" } ?: "")).optJSONArray("photos")?.map {
            val u = it.optJSONObject("user")
            Photo(it.getInt("id"), it.getString("url"), it.str("thumbnailUrl"), it.str("caption"), listOfNotNull(u?.str("firstName"), u?.str("lastName")).joinToString(" "))
        } ?: emptyList()
    }

    // ---------- Comunidad ----------
    suspend fun questions(): List<Question> =
        call("GET", "/api/community/questions").optJSONArray("questions")?.map {
            val u = it.optJSONObject("user")
            Question(it.getInt("id"), it.getString("title"), it.optString("content"), listOfNotNull(u?.str("firstName"), u?.str("lastName")).joinToString(" "),
                it.optJSONObject("_count")?.optInt("answers") ?: 0, it.optBoolean("isResolved"))
        } ?: emptyList()

    suspend fun ask(title: String, content: String) {
        call("POST", "/api/community/questions", JSONObject().put("title", title).put("content", content))
    }

    // ---------- Recomendaciones (Yelp vía backend) ----------
    suspend fun recommendations(query: String): List<Place> =
        call("GET", "/api/recommendations?lat=37.3891&lng=-5.9845&limit=15&query=" + java.net.URLEncoder.encode(query, "UTF-8"))
            .optJSONArray("items")?.map {
                Place(it.getString("name"), it.str("address"), if (it.isNull("rating")) null else it.optDouble("rating"),
                    it.optJSONArray("photos")?.optJSONObject(0)?.str("url"), it.str("url"))
            } ?: emptyList()

    // ---------- Cursos ----------
    /** Devuelve (nivel desbloqueado, mejores notas por índice de nivel 0..9). */
    suspend fun courseProgress(): Pair<Int, Map<Int, Int>> {
        val p = call("GET", "/api/cursos/progreso").optJSONObject("progress") ?: return 1 to emptyMap()
        val scores = p.optJSONObject("levelScores")
        val map = scores?.keys()?.asSequence()?.mapNotNull { k ->
            val idx = k.toIntOrNull()?.minus(1) ?: return@mapNotNull null
            idx to (scores.optJSONObject(k)?.optInt("score") ?: 0)
        }?.toMap() ?: emptyMap()
        return p.optInt("currentLevel", 1) to map
    }

    suspend fun saveCourseProgress(unlocked: Int, best: Map<Int, Int>, passing: Int) {
        val now = Instant.now().toString()
        val scores = JSONObject()
        best.filter { it.value >= passing }.forEach { (i, s) ->
            scores.put((i + 1).toString(), JSONObject().put("score", s).put("completedAt", now).put("lastAttemptAt", now).put("attempts", 1))
        }
        val avg = if (best.isEmpty()) 0 else best.values.average().toInt()
        val stats = JSONObject().put("completedLevels", scores.length()).put("averageScore", avg)
        call("POST", "/api/cursos/progreso", JSONObject().put("currentLevel", unlocked).put("levelScores", scores).put("achievements", JSONArray()).put("stats", stats))
    }

    suspend fun feedback(message: String) {
        call("POST", "/api/feedback", JSONObject().put("message", message).put("language", "es"))
    }

    // ---------- Registro / contraseña ----------
    data class School(val id: Int, val name: String, val country: String?)

    suspend fun schools(): List<School> = call("GET", "/api/schools", retry = false).optJSONArray("schools")?.map {
        School(it.getInt("id"), it.getString("name"), it.str("country"))
    }?.sortedBy { it.name } ?: emptyList()

    suspend fun register(firstName: String, lastName: String, email: String, password: String, age: String, schoolId: Int?, residence: String?, country: String, city: String): User {
        val b = JSONObject().put("firstName", firstName).put("lastName", lastName).put("name", "$firstName $lastName".trim())
            .put("email", email.trim()).put("password", password).put("country", country).put("city", city)
        if (age.isNotBlank()) b.put("age", age)
        schoolId?.let { b.put("schoolId", it) }
        residence?.let { b.put("residence", it) }
        val r = withContext(Dispatchers.IO) { raw("POST", "/api/auth/register", b) }
        if (r.first >= 400) throw ApiError(runCatching { JSONObject(r.second).optString("error") }.getOrNull()?.ifBlank { null } ?: "Error ${r.first}")
        return login(email, password)
    }

    suspend fun forgotPassword(email: String): String {
        val r = withContext(Dispatchers.IO) { raw("POST", "/api/auth/forgot-password", JSONObject().put("email", email.trim())) }
        val j = runCatching { JSONObject(r.second) }.getOrElse { JSONObject() }
        if (r.first >= 400) throw ApiError(j.optString("error", "Error ${r.first}"))
        return j.optString("message", "Si el email existe, recibirás un enlace para restablecer la contraseña.")
    }

    // ---------- Administración ----------
    data class AdminUser(val id: Int, val email: String, val name: String, val role: String)
    data class LogItem(val action: String, val email: String?, val at: ZonedDateTime?)

    suspend fun adminUsers(): List<AdminUser> = withContext(Dispatchers.IO) {
        val (code, text) = raw("GET", "/api/admin/users", null)
        if (code == 401 || code in 300..399) throw AuthExpired()
        if (code >= 400) throw ApiError("Error $code")
        JSONArray(text).map { AdminUser(it.getInt("id"), it.getString("email"), listOfNotNull(it.str("firstName"), it.str("lastName")).joinToString(" ").ifBlank { it.str("name") ?: "" }, it.optString("role")) }
    }

    suspend fun activeUsers(): Int = call("GET", "/api/admin/active-users").optJSONArray("users")?.length() ?: 0

    suspend fun logs(): List<LogItem> = call("GET", "/api/admin/logs?page=1&pageSize=30").optJSONArray("items")?.map {
        LogItem(it.optString("action"), it.optJSONObject("user")?.str("email"), parseDate(it.str("createdAt")))
    } ?: emptyList()

    /** Lee el ICS de Teamup en el servidor (próximos 7 días). Puede tardar: timeout de 3 min. */
    suspend fun syncCalendar(): String {
        val r = call("POST", "/api/admin/schools/sync-ics", JSONObject(), timeoutMs = 180_000)
        val res = r.optJSONObject("results") ?: return r.optString("message", "Sincronización completada")
        val schools = res.optJSONArray("schools")?.length() ?: 0
        return "Calendario sincronizado con Teamup: $schools escuelas · ${res.optInt("eventsCreated")} eventos nuevos, " +
            "${res.optInt("eventsUpdated")} actualizados, ${res.optInt("eventsDeleted")} pasados eliminados" +
            (if (res.optInt("schoolsCreated") > 0) " · ${res.optInt("schoolsCreated")} escuelas nuevas" else "")
    }

    data class SchoolCalendar(val school: String, val events: List<ProgramEvent>)

    /** Eventos futuros de todas las escuelas (lo que hay ahora en la base de datos). */
    suspend fun calendarOverview(): List<SchoolCalendar> =
        call("GET", "/api/admin/schools/sync-ics", timeoutMs = 60_000).optJSONArray("schools")?.map { g ->
            SchoolCalendar(g.optJSONObject("school")?.optString("name") ?: "?", g.optJSONArray("events")?.map {
                ProgramEvent(it.getInt("id"), it.getString("title"), parseDate(it.str("date"))!!, parseDate(it.str("endDate")), it.str("location"), it.str("who"), it.optBoolean("isAllDay"))
            } ?: emptyList())
        }?.sortedBy { it.school } ?: emptyList()

    suspend fun clearCalendar(): String = call("POST", "/api/admin/schools/clear-events", JSONObject()).optString("message", "Eventos eliminados")

    suspend fun publishAnnouncement(message: String) {
        call("POST", "/api/announcement", JSONObject().put("message", message).put("userId", user?.id))
    }

    suspend fun deleteAnnouncement() { call("DELETE", "/api/announcement", JSONObject().put("userId", user?.id)) }
}
