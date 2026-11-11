package es.almaaura.mierasmus.data

import android.content.Context
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import org.json.JSONArray

/** Lugares del mapa (copiados de src/data/places.ts de la web app). */
data class MapPlace(
    val id: String, val name: String, val desc: String, val category: String,
    val lat: Double, val lng: Double, val image: String?, val address: String?, val link: String?,
) {
    val imageUrl: String? get() = image?.let { Api.BASE + it.replace(" ", "%20") }
    val directionsUrl get() = "https://www.google.com/maps/dir/?api=1&destination=$lat,$lng&travelmode=walking"
    val mapsUrl get() = "https://www.google.com/maps/search/?api=1&query=$lat,$lng"
}

object Places {
    private var cache: List<MapPlace>? = null
    fun all(ctx: Context): List<MapPlace> = cache ?: run {
        val arr = JSONArray(ctx.assets.open("places.json").bufferedReader().use { it.readText() })
        (0 until arr.length()).map { i ->
            val o = arr.getJSONObject(i)
            fun s(k: String) = if (o.isNull(k)) null else o.optString(k).ifBlank { null }
            MapPlace(o.getString("id"), o.getString("name"), o.optString("desc"), o.getString("cat"),
                o.getDouble("lat"), o.getDouble("lng"), s("img"), s("addr"), s("link"))
        }.also { cache = it }
    }

    fun byName(ctx: Context, name: String) = all(ctx).firstOrNull { it.name.equals(name, true) }

    /** Lugar que el mapa debe enfocar al abrirse (desde Descubre Sevilla o el buscador). */
    var focusId by mutableStateOf<String?>(null)

    private fun prefs(ctx: Context) = ctx.getSharedPreferences("places", Context.MODE_PRIVATE)
    fun saved(ctx: Context): Set<String> = prefs(ctx).getStringSet("saved", emptySet())!!
    fun toggleSaved(ctx: Context, id: String): Boolean {
        val s = saved(ctx).toMutableSet()
        val now = if (id in s) { s.remove(id); false } else { s.add(id); true }
        prefs(ctx).edit().putStringSet("saved", s).apply()
        return now
    }

    /** Filtros del mapa → categorías de la web. */
    val filters = listOf(
        "Todos" to emptySet(),
        "Guardados" to setOf("__saved"),
        "Cultura" to setOf("Cultural"),
        "Comer" to setOf("Comida"),
        "Ocio" to setOf("Ocio"),
        "Transporte" to setOf("Transporte", "Metro"),
        "Salud" to setOf("Salud"),
        "Residencias" to setOf("Residencia"),
        "Servicios" to setOf("Servicios"),
    )
}
