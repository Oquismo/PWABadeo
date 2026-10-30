package es.almaaura.mierasmus.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Campaign
import androidx.compose.material.icons.rounded.Sync
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import es.almaaura.mierasmus.data.Api
import es.almaaura.mierasmus.data.AuthExpired
import es.almaaura.mierasmus.data.hm
import es.almaaura.mierasmus.ui.components.BottomBarSpacer
import es.almaaura.mierasmus.ui.components.EmptyNote
import es.almaaura.mierasmus.ui.components.Hairline
import es.almaaura.mierasmus.ui.components.LoadView
import es.almaaura.mierasmus.ui.components.Pill
import es.almaaura.mierasmus.ui.components.Session
import es.almaaura.mierasmus.ui.components.rememberLoad
import es.almaaura.mierasmus.ui.theme.AppType
import es.almaaura.mierasmus.ui.theme.Palette
import kotlinx.coroutines.launch

/** Panel de administración (mismas secciones que /admin en la web app). */
@Composable
fun AdminScreen() {
    var section by rememberSaveable { mutableStateOf("Programa") }
    Column(
        Modifier.fillMaxSize().statusBarsPadding().verticalScroll(rememberScrollState()).padding(start = 20.dp, end = 20.dp, top = 16.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        Text("Administración", style = AppType.LargeTitle, color = Palette.OnSurface)
        Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf("Programa", "Anuncios", "Usuarios", "Actividad", "Escuelas").forEach { s ->
                val sel = s == section
                Text(s, style = AppType.BodyStrong.copy(fontSize = 14.sp), color = if (sel) Palette.OnLime else Palette.OnSurface,
                    modifier = Modifier.clip(CircleShape).background(if (sel) Palette.Lime else Palette.Surface)
                        .clickable(role = Role.Tab) { section = s }.padding(horizontal = 16.dp, vertical = 10.dp))
            }
        }
        when (section) {
            "Programa" -> ProgramaAdmin()
            "Anuncios" -> AnunciosAdmin()
            "Usuarios" -> UsuariosAdmin()
            "Actividad" -> ActividadAdmin()
            else -> EscuelasAdmin()
        }
        BottomBarSpacer()
        Spacer(Modifier.navigationBarsPadding())
    }
}

@Composable
private fun runAction(onResult: (String) -> Unit): (suspend () -> String) -> Unit {
    val scope = rememberCoroutineScope()
    return { block ->
        scope.launch {
            onResult(try { block() } catch (e: AuthExpired) { Session.user = null; "Sesión caducada" } catch (e: Exception) { "Error: ${e.message}" })
        }
    }
}

@Composable
private fun ProgramaAdmin() {
    var msg by remember { mutableStateOf<String?>(null) }
    var busy by remember { mutableStateOf(false) }
    var confirm by remember { mutableStateOf(false) }
    var open by rememberSaveable { mutableStateOf<String?>(null) }
    val overview = rememberLoad { Api.calendarOverview() }
    val run = runAction { msg = it; busy = false; overview.reload() }
    Text("Lee el calendario de Teamup y actualiza los eventos de los próximos 7 días de todas las escuelas. Puede tardar hasta un minuto.", style = AppType.Body, color = Palette.Muted)
    LimeButton(if (busy) "Sincronizando con Teamup…" else "Refrescar calendario", Icons.Rounded.Sync) {
        if (!busy) { busy = true; msg = null; run { Api.syncCalendar() } }
    }
    msg?.let { EmptyNote(it) }
    Text("CALENDARIO ACTUAL", style = AppType.Overline, color = Palette.Muted)
    LoadView(overview) { list ->
        if (list.isEmpty()) EmptyNote("No hay eventos futuros. Pulsa «Refrescar calendario».")
        else Card {
            list.forEachIndexed { i, sc ->
                val expanded = open == sc.school
                ListRow(sc.school, "${sc.events.size} eventos", onClick = { open = if (expanded) null else sc.school },
                    trailing = { Pill(if (expanded) "OCULTAR" else "VER", bg = Palette.SurfaceHigh, fg = Palette.Muted) })
                if (expanded) sc.events.forEach { e ->
                    val d = e.start.toLocalDate()
                    Text("${d.dayOfMonth}/${d.monthValue} ${if (e.allDay) "" else e.start.hm()} · ${e.title}" + (e.location?.let { " · $it" } ?: ""),
                        style = AppType.Caption, color = Palette.OnSurface, modifier = Modifier.padding(start = 28.dp, end = 16.dp, bottom = 10.dp))
                }
                if (i < list.lastIndex) Hairline()
            }
        }
    }
    Card { ListRow("Borrar todos los eventos", "Vacía el calendario antes de una sincronización limpia", onClick = { confirm = true }) }
    if (confirm) AlertDialog(
        onDismissRequest = { confirm = false }, containerColor = Palette.Surface,
        title = { Text("¿Borrar todos los eventos?", color = Palette.OnSurface) },
        text = { Text("Se eliminarán los eventos de todas las escuelas. Después puedes volver a sincronizar.", color = Palette.Muted) },
        confirmButton = { TextButton(onClick = { confirm = false; busy = true; run { Api.clearCalendar() } }) { Text("Borrar", color = Palette.Danger) } },
        dismissButton = { TextButton(onClick = { confirm = false }) { Text("Cancelar", color = Palette.Muted) } },
    )
}

@Composable
private fun AnunciosAdmin() {
    var text by rememberSaveable { mutableStateOf("") }
    var msg by remember { mutableStateOf<String?>(null) }
    val current = rememberLoad { Api.announcement() }
    val run = runAction { msg = it; current.reload() }
    Text("AVISO ACTUAL", style = AppType.Overline, color = Palette.Muted)
    LoadView(current) { a -> EmptyNote(a?.message ?: "No hay ningún aviso publicado.") }
    OutlinedTextField(text, { text = it }, label = { Text("Nuevo aviso para todos") }, minLines = 3, colors = fieldColors(), modifier = Modifier.fillMaxWidth())
    LimeButton("Publicar y notificar", Icons.Rounded.Campaign) {
        if (text.isNotBlank()) run { Api.publishAnnouncement(text.trim()); text = ""; "Aviso publicado" }
    }
    Card { ListRow("Borrar el último aviso", onClick = { run { Api.deleteAnnouncement(); "Aviso borrado" } }) }
    msg?.let { Text(it, style = AppType.Body, color = Palette.Lime) }
}

@Composable
private fun UsuariosAdmin() {
    val users = rememberLoad { Api.adminUsers() to Api.activeUsers() }
    LoadView(users) { (list, active) ->
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Pill("${list.size} USUARIOS", bg = Palette.Surface, fg = Palette.OnSurface)
            Pill("$active ACTIVOS AHORA", bg = Palette.Lime, fg = Palette.OnLime)
        }
        Card {
            list.forEachIndexed { i, u ->
                ListRow(u.name.ifBlank { u.email }, u.email, trailing = { if (u.role == "admin") Pill("ADMIN", bg = Palette.Orange, fg = Palette.OnOrange) })
                if (i < list.lastIndex) Hairline()
            }
        }
    }
}

@Composable
private fun ActividadAdmin() {
    val logs = rememberLoad { Api.logs() }
    LoadView(logs) { list ->
        if (list.isEmpty()) EmptyNote("Sin actividad registrada.")
        else Card {
            list.forEachIndexed { i, l ->
                ListRow(l.action, listOfNotNull(l.email, l.at?.let { "${it.dayOfMonth}/${it.monthValue} ${it.hm()}" }).joinToString(" · "))
                if (i < list.lastIndex) Hairline()
            }
        }
    }
}

@Composable
private fun EscuelasAdmin() {
    val schools = rememberLoad { Api.schools() }
    LoadView(schools) { list ->
        Text("${list.size} escuelas", style = AppType.Body, color = Palette.Muted)
        Card {
            list.forEachIndexed { i, s ->
                ListRow(s.name, s.country)
                if (i < list.lastIndex) Hairline()
            }
        }
    }
}
