package es.almaaura.mierasmus.ui.screens

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.Call
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.Star
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import es.almaaura.mierasmus.data.Api
import es.almaaura.mierasmus.data.AuthExpired
import es.almaaura.mierasmus.data.Madrid
import es.almaaura.mierasmus.data.SampleData
import es.almaaura.mierasmus.data.hm
import es.almaaura.mierasmus.data.now
import es.almaaura.mierasmus.data.today
import es.almaaura.mierasmus.data.weekdayShort
import es.almaaura.mierasmus.ui.components.EmptyNote
import es.almaaura.mierasmus.ui.components.Hairline
import es.almaaura.mierasmus.ui.components.LoadView
import es.almaaura.mierasmus.ui.components.Pill
import es.almaaura.mierasmus.ui.components.Session
import es.almaaura.mierasmus.ui.components.openUrl
import es.almaaura.mierasmus.ui.components.rememberLoad
import es.almaaura.mierasmus.ui.theme.AppType
import es.almaaura.mierasmus.ui.theme.Palette
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

/** Ejecuta una llamada y gestiona sesión caducada / errores. */
private suspend fun guarded(onError: (String) -> Unit, block: suspend () -> Unit) {
    try { block() } catch (e: AuthExpired) { Session.user = null } catch (e: Exception) { onError(e.message ?: "Sin conexión") }
}

// ---------- Notificaciones: aviso del coordinador + recordatorios del programa ----------

@Composable
fun NotificacionesScreen(onBack: () -> Unit, open: (Overlay) -> Unit) {
    val loader = rememberLoad { Api.announcement() to Api.schoolEvents(today(), today().plusDays(2)).filter { it.start > now() } }
    DetailScaffold("Notificaciones", onBack) {
        LoadView(loader) { (ann, soon) ->
            if (ann != null) Column(
                Modifier.fillMaxWidth().clip(RoundedCornerShape(24.dp)).background(Palette.Lime).padding(18.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                Text("AVISO" + (ann.by?.let { " · $it" } ?: ""), style = AppType.Overline, color = Palette.OnLime)
                Text(ann.message, style = AppType.Body, color = Palette.OnLime)
            }
            if (soon.isEmpty() && ann == null) EmptyNote("No tienes notificaciones.")
            if (soon.isNotEmpty()) Card {
                soon.forEachIndexed { i, e ->
                    ListRow(e.title, "${if (e.start.toLocalDate() == today()) "Hoy" else e.start.toLocalDate().weekdayShort()} · ${e.start.hm()}" + (e.location?.let { " · $it" } ?: ""),
                        leading = { Box(Modifier.size(10.dp).clip(CircleShape).background(Palette.Lime)) })
                    if (i < soon.lastIndex) Hairline()
                }
            }
        }
    }
}

// ---------- Eventos de la comunidad (/api/user-events) ----------

@Composable
fun EventosScreen(onBack: () -> Unit) {
    val scope = rememberCoroutineScope()
    val loader = rememberLoad { Api.communityEvents() }
    var creating by remember { mutableStateOf(false) }
    DetailScaffold("Eventos", onBack) {
        Text("Planes de la comunidad. Cualquiera puede proponer uno.", style = AppType.Body, color = Palette.Muted)
        LimeButton("Crear evento", Icons.Rounded.Add) { creating = true }
        LoadView(loader) { events ->
            val list = events.filter { it.date >= now().minusHours(6) }
            if (list.isEmpty()) EmptyNote("Todavía no hay eventos. ¡Crea el primero!")
            else Card {
                list.forEachIndexed { i, e ->
                    val d = e.date.toLocalDate()
                    ListRow(e.title, "${d.weekdayShort()} ${d.dayOfMonth}/${d.monthValue} · ${e.date.hm()}",
                        trailing = { if (!e.isPublic) Pill("PRIVADO", bg = Palette.SurfaceHigh, fg = Palette.Muted) })
                    if (i < list.lastIndex) Hairline()
                }
            }
        }
    }
    if (creating) {
        var t by remember { mutableStateOf("") }
        var d by remember { mutableStateOf("") }
        var h by remember { mutableStateOf("") }
        var err by remember { mutableStateOf<String?>(null) }
        var busy by remember { mutableStateOf(false) }
        AlertDialog(
            onDismissRequest = { creating = false },
            containerColor = Palette.Surface,
            title = { Text("Nuevo evento", color = Palette.OnSurface) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(t, { t = it }, label = { Text("Título") }, singleLine = true, colors = fieldColors())
                    OutlinedTextField(d, { d = it }, label = { Text("Fecha (dd/mm/aaaa)") }, singleLine = true, colors = fieldColors())
                    OutlinedTextField(h, { h = it }, label = { Text("Hora (hh:mm)") }, singleLine = true, colors = fieldColors())
                    err?.let { Text(it, color = Palette.Danger) }
                }
            },
            confirmButton = {
                TextButton(enabled = t.isNotBlank() && !busy, onClick = {
                    val date = runCatching {
                        ZonedDateTime.of(LocalDate.parse(d.trim(), DateTimeFormatter.ofPattern("d/M/yyyy")),
                            if (h.isBlank()) LocalTime.NOON else LocalTime.parse(h.trim(), DateTimeFormatter.ofPattern("H:mm")), Madrid)
                    }.getOrNull()
                    if (date == null) { err = "Revisa la fecha y la hora"; return@TextButton }
                    busy = true
                    scope.launch {
                        guarded({ err = it }) { Api.createEvent(t.trim(), date); creating = false; loader.reload() }
                        busy = false
                    }
                }) { Text("Publicar", color = Palette.Lime) }
            },
            dismissButton = { TextButton(onClick = { creating = false }) { Text("Cancelar", color = Palette.Muted) } },
        )
    }
}

// ---------- Checklist (se guarda en el móvil) ----------

@Composable
fun ChecklistScreen(onBack: () -> Unit) {
    val ctx = LocalContext.current
    val prefs = remember { ctx.getSharedPreferences("checklist", Context.MODE_PRIVATE) }
    val done = remember { mutableStateListOf(*prefs.getStringSet("done", emptySet())!!.toTypedArray()) }
    val items = SampleData.checklist
    DetailScaffold("Checklist de llegada", onBack) {
        Text("${items.count { it in done }} de ${items.size} completadas", style = AppType.Body, color = Palette.Muted)
        Card {
            items.forEachIndexed { i, item ->
                val ok = item in done
                ListRow(item, onClick = {
                    if (ok) done.remove(item) else done.add(item)
                    prefs.edit().putStringSet("done", done.toSet()).apply()
                }, leading = {
                    Box(Modifier.size(26.dp).clip(RoundedCornerShape(8.dp)).background(if (ok) Palette.Lime else Palette.SurfaceHighest), contentAlignment = Alignment.Center) {
                        if (ok) Icon(Icons.Rounded.Check, null, tint = Palette.OnLime, modifier = Modifier.size(18.dp))
                    }
                })
                if (i < items.lastIndex) Hairline()
            }
        }
    }
}

// ---------- Residencia (teléfonos de la web app) ----------

@Composable
fun ResidenciaScreen(onBack: () -> Unit) {
    val ctx = LocalContext.current
    val residences = listOf("Residencia ONE" to "+34 955 11 22 33", "Residencia AMRO" to "+34 644 93 47 760", "Residencia Estanislao" to "+34 955 22 33 44")
    DetailScaffold("Residencia", onBack) {
        Text("Contacto directo con las residencias del programa.", style = AppType.Body, color = Palette.Muted)
        Card {
            residences.forEachIndexed { i, (name, num) ->
                ListRow(name, num, onClick = { ctx.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:" + num.replace(" ", "")))) },
                    trailing = { Icon(Icons.Rounded.Call, "Llamar", tint = Palette.Lime) })
                if (i < residences.lastIndex) Hairline()
            }
        }
    }
}

// ---------- Álbum (/api/photos) ----------

@Composable
fun AlbumScreen(onBack: () -> Unit) {
    val loader = rememberLoad { Api.photos() }
    var viewing by remember { mutableStateOf<String?>(null) }
    DetailScaffold("Álbum", onBack) {
        LoadView(loader) { photos ->
            if (photos.isEmpty()) EmptyNote("Aún no hay fotos. Súbelas desde la web app.")
            photos.chunked(2).forEach { row ->
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    row.forEach { p ->
                        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            AsyncImage(
                                model = p.thumb ?: p.url, contentDescription = p.caption ?: "Foto de ${p.author}",
                                contentScale = ContentScale.Crop,
                                modifier = Modifier.fillMaxWidth().aspectRatio(1f).clip(RoundedCornerShape(20.dp)).background(Palette.Surface)
                                    .clickable(role = Role.Image) { viewing = p.url },
                            )
                            Text(p.caption ?: p.author, style = AppType.Caption, color = Palette.Muted, maxLines = 1)
                        }
                    }
                    if (row.size == 1) Box(Modifier.weight(1f))
                }
            }
        }
    }
    viewing?.let { url ->
        AlertDialog(
            onDismissRequest = { viewing = null },
            containerColor = Palette.Ground,
            text = { AsyncImage(model = url, contentDescription = null, contentScale = ContentScale.Fit, modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp))) },
            confirmButton = { TextButton(onClick = { viewing = null }) { Icon(Icons.Rounded.Close, "Cerrar", tint = Palette.OnSurface) } },
        )
    }
}

// ---------- Comunidad (/api/community/questions) ----------

@Composable
fun ComunidadScreen(onBack: () -> Unit) {
    val scope = rememberCoroutineScope()
    val loader = rememberLoad { Api.questions() }
    var asking by remember { mutableStateOf(false) }
    DetailScaffold("Comunidad", onBack) {
        Text("Pregunta lo que necesites a otros estudiantes.", style = AppType.Body, color = Palette.Muted)
        LimeButton("Hacer una pregunta", Icons.Rounded.Add) { asking = true }
        LoadView(loader) { qs ->
            if (qs.isEmpty()) EmptyNote("Todavía no hay preguntas.")
            else Card {
                qs.forEachIndexed { i, q ->
                    ListRow(q.title, "${q.author} · ${q.answers} respuesta${if (q.answers == 1) "" else "s"}",
                        trailing = { if (q.resolved) Pill("RESUELTA", bg = Palette.Lime, fg = Palette.OnLime) })
                    if (i < qs.lastIndex) Hairline()
                }
            }
        }
    }
    if (asking) {
        var t by remember { mutableStateOf("") }
        var c by remember { mutableStateOf("") }
        var err by remember { mutableStateOf<String?>(null) }
        AlertDialog(
            onDismissRequest = { asking = false },
            containerColor = Palette.Surface,
            title = { Text("Nueva pregunta", color = Palette.OnSurface) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(t, { t = it }, label = { Text("Título") }, singleLine = true, colors = fieldColors())
                    OutlinedTextField(c, { c = it }, label = { Text("Detalles") }, minLines = 3, colors = fieldColors())
                    err?.let { Text(it, color = Palette.Danger) }
                }
            },
            confirmButton = {
                TextButton(enabled = t.isNotBlank() && c.isNotBlank(), onClick = {
                    scope.launch { guarded({ err = it }) { Api.ask(t.trim(), c.trim()); asking = false; loader.reload() } }
                }) { Text("Publicar", color = Palette.Lime) }
            },
            dismissButton = { TextButton(onClick = { asking = false }) { Text("Cancelar", color = Palette.Muted) } },
        )
    }
}

// ---------- Recomendaciones (/api/recommendations, Yelp) ----------

@Composable
fun RecomendacionesScreen(onBack: () -> Unit) {
    val ctx = LocalContext.current
    val cats = listOf("Restaurantes" to "restaurants", "Cafés" to "coffee", "Bares" to "bars", "Tapas" to "tapas")
    var cat by rememberSaveable { mutableStateOf(cats.first().second) }
    val loader = rememberLoad(cat) { Api.recommendations(cat) }
    DetailScaffold("Recomendaciones", onBack) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            cats.forEach { (label, q) ->
                val sel = q == cat
                Text(label, style = AppType.BodyStrong.copy(fontSize = 14.sp), color = if (sel) Palette.OnLime else Palette.OnSurface,
                    modifier = Modifier.clip(CircleShape).background(if (sel) Palette.Lime else Palette.Surface).clickable(role = Role.Button) { cat = q }
                        .padding(horizontal = 14.dp, vertical = 10.dp))
            }
        }
        LoadView(loader) { places ->
            if (places.isEmpty()) EmptyNote("Sin resultados.")
            places.forEach { p ->
                Row(
                    Modifier.fillMaxWidth().clip(RoundedCornerShape(24.dp)).background(Palette.Surface)
                        .clickable(enabled = p.url != null, role = Role.Button) { p.url?.let { ctx.openUrl(it) } }.padding(12.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically,
                ) {
                    AsyncImage(p.image, null, contentScale = ContentScale.Crop, modifier = Modifier.size(72.dp).clip(RoundedCornerShape(16.dp)).background(Palette.SurfaceHigh))
                    Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                        Text(p.name, style = AppType.BodyStrong, color = Palette.OnSurface)
                        p.address?.let { Text(it, style = AppType.Caption, color = Palette.Muted, maxLines = 2) }
                        p.rating?.let {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Rounded.Star, null, tint = Palette.Amber, modifier = Modifier.size(14.dp))
                                Text(" $it", style = AppType.Caption, color = Palette.OnSurface)
                            }
                        }
                    }
                }
            }
        }
    }
}

// ---------- Editar perfil (/api/user/update) ----------

@Composable
fun EditarPerfilScreen(onBack: () -> Unit) {
    val scope = rememberCoroutineScope()
    val u = Session.user
    var name by rememberSaveable { mutableStateOf(u?.firstName ?: u?.name ?: "") }
    var age by rememberSaveable { mutableStateOf(u?.age?.toString() ?: "") }
    var city by rememberSaveable { mutableStateOf(u?.city ?: "") }
    var country by rememberSaveable { mutableStateOf(u?.country ?: "") }
    var msg by remember { mutableStateOf<String?>(null) }
    var busy by remember { mutableStateOf(false) }
    DetailScaffold("Editar perfil", onBack) {
        OutlinedTextField(name, { name = it }, label = { Text("Nombre") }, singleLine = true, colors = fieldColors(), modifier = Modifier.fillMaxWidth())
        OutlinedTextField(age, { age = it.filter(Char::isDigit).take(3) }, label = { Text("Edad") }, singleLine = true, colors = fieldColors(), modifier = Modifier.fillMaxWidth())
        OutlinedTextField(city, { city = it }, label = { Text("Ciudad") }, singleLine = true, colors = fieldColors(), modifier = Modifier.fillMaxWidth())
        OutlinedTextField(country, { country = it }, label = { Text("País") }, singleLine = true, colors = fieldColors(), modifier = Modifier.fillMaxWidth())
        msg?.let { Text(it, style = AppType.Body, color = Palette.Muted) }
        LimeButton(if (busy) "Guardando…" else "Guardar cambios") {
            if (busy) return@LimeButton
            busy = true
            scope.launch {
                guarded({ msg = it }) { Session.user = Api.updateUser(name.trim(), age, city.trim(), country.trim()); msg = "Perfil actualizado" }
                busy = false
            }
        }
    }
}

// ---------- Ajustes ----------

@Composable
fun AjustesScreen(onBack: () -> Unit) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    var feedback by remember { mutableStateOf<Boolean>(false) }
    DetailScaffold("Ajustes", onBack) {
        Card {
            ListRow("Idioma", "Español")
            Hairline()
            ListRow("Política de privacidad", onClick = { ctx.openUrl(Api.BASE + "/politica-privacidad") }, trailing = { Chevron() })
            Hairline()
            ListRow("Enviar comentarios", onClick = { feedback = true }, trailing = { Chevron() })
            Hairline()
            ListRow("Eliminar mi cuenta", "Se gestiona desde la web app", onClick = { ctx.openUrl(Api.BASE + "/ajustes") }, trailing = { Chevron() })
        }
        LimeButton("Cerrar sesión") { scope.launch { Api.logout(); Session.user = null } }
    }
    if (feedback) {
        var t by remember { mutableStateOf("") }
        var sent by remember { mutableStateOf(false) }
        AlertDialog(
            onDismissRequest = { feedback = false },
            containerColor = Palette.Surface,
            title = { Text(if (sent) "¡Gracias!" else "Tu opinión", color = Palette.OnSurface) },
            text = {
                if (sent) Text("Hemos recibido tus comentarios.", color = Palette.Muted)
                else OutlinedTextField(t, { t = it }, label = { Text("Sugerencias o problemas") }, minLines = 4, colors = fieldColors())
            },
            confirmButton = {
                TextButton(onClick = {
                    if (sent) feedback = false
                    else scope.launch { guarded({}) { Api.feedback(t.trim()); sent = true } }
                }, enabled = sent || t.isNotBlank()) { Text(if (sent) "Cerrar" else "Enviar", color = Palette.Lime) }
            },
        )
    }
}
