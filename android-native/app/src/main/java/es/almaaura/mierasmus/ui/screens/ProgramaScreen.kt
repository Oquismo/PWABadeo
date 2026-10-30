package es.almaaura.mierasmus.ui.screens

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ChevronLeft
import androidx.compose.material.icons.rounded.ChevronRight
import androidx.compose.material.icons.rounded.Place
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import es.almaaura.mierasmus.data.Api
import es.almaaura.mierasmus.data.ProgramEvent
import es.almaaura.mierasmus.data.hm
import es.almaaura.mierasmus.data.monthLong
import es.almaaura.mierasmus.data.now
import es.almaaura.mierasmus.data.today
import es.almaaura.mierasmus.data.weekdayLong
import es.almaaura.mierasmus.data.weekdayShort
import es.almaaura.mierasmus.ui.components.BottomBarSpacer
import es.almaaura.mierasmus.ui.components.EmptyNote
import es.almaaura.mierasmus.ui.components.LoadView
import es.almaaura.mierasmus.ui.components.Pill
import es.almaaura.mierasmus.ui.components.Session
import es.almaaura.mierasmus.ui.components.Tab
import es.almaaura.mierasmus.ui.components.rememberLoad
import es.almaaura.mierasmus.ui.theme.AppType
import es.almaaura.mierasmus.ui.theme.Palette
import java.time.DayOfWeek
import java.time.LocalDate

@Composable
fun ProgramaScreen(onNavigate: (Tab) -> Unit) {
    var selectedEpoch by rememberSaveable { mutableLongStateOf(today().toEpochDay()) }
    var view by rememberSaveable { mutableStateOf("Semana") }
    val selected = LocalDate.ofEpochDay(selectedEpoch)
    val weekStart = selected.with(DayOfWeek.MONDAY)
    // Todo el programa de la escuela (±6 meses) para calcular el progreso y la lista.
    val loader = rememberLoad(Session.user?.schoolId) { Api.schoolEvents(today().minusMonths(6), today().plusMonths(6)) }

    LazyColumn(
        modifier = Modifier.fillMaxSize().statusBarsPadding(),
        contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = 16.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp),
    ) {
        item {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.SpaceBetween) {
                Column {
                    Text("${selected.monthLong().replaceFirstChar { it.uppercase() }} ${selected.year}", style = AppType.Body.copy(fontSize = 15.sp), color = Palette.Muted)
                    Text("Programa", style = AppType.LargeTitle, color = Palette.OnSurface)
                }
                Pill(Session.user?.schoolName ?: "Programa cerrado", bg = Palette.SurfaceHigh, fg = Palette.Muted)
            }
        }
        item { Segmented(listOf("Semana", "Mes", "Lista"), view) { view = it } }

        if (Session.user?.schoolId == null) {
            item { EmptyNote(if (Session.user?.role == "admin") "Tu cuenta de administrador no tiene escuela. Consulta y sincroniza el calendario de todas las escuelas en Admin › Programa." else "Tu cuenta no tiene escuela asignada. Pide al coordinador que te asigne una para ver el programa.") }
        } else item {
            LoadView(loader) { all ->
                Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
                    FormativeCard(all)
                    when (view) {
                        "Semana" -> {
                            WeekStrip(weekStart, selected, all, onSelect = { selectedEpoch = it.toEpochDay() })
                            val dayEvents = all.filter { it.start.toLocalDate() == selected }
                            Text((if (selected == today()) "Hoy · " else "") + "${selected.weekdayLong()} ${selected.dayOfMonth}", style = AppType.Section, color = Palette.OnSurface)
                            if (dayEvents.isEmpty()) FreeRow(onExplore = { onNavigate(Tab.Mapa) })
                            dayEvents.forEach { TimelineRow(it) }
                        }
                        "Mes" -> Grouped(all.filter { it.start.month == selected.month && it.start.year == selected.year }, "No hay actividades este mes.")
                        else -> Grouped(all.filter { it.start.toLocalDate() >= today() }, "No hay actividades próximas.")
                    }
                }
            }
        }
        item {
            BottomBarSpacer()
            Spacer(Modifier.navigationBarsPadding())
        }
    }
}

@Composable
private fun Grouped(events: List<ProgramEvent>, empty: String) {
    if (events.isEmpty()) { EmptyNote(empty); return }
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        events.groupBy { it.start.toLocalDate() }.forEach { (d, list) ->
            Text("${d.weekdayLong()} ${d.dayOfMonth} de ${d.monthLong()}", style = AppType.BodyStrong, color = Palette.Muted, modifier = Modifier.padding(top = 4.dp))
            list.forEach { TimelineRow(it) }
        }
    }
}

@Composable
private fun Segmented(options: List<String>, selected: String, onSelect: (String) -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().clip(CircleShape).background(Palette.Surface).padding(4.dp),
        horizontalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        options.forEach { opt ->
            val isSel = opt == selected
            val bg by animateColorAsState(if (isSel) Palette.SurfaceHighest else Color.Transparent, label = "seg")
            Box(
                modifier = Modifier.weight(1f).height(40.dp).clip(CircleShape).background(bg).clickable(role = Role.Tab) { onSelect(opt) },
                contentAlignment = Alignment.Center,
            ) {
                Text(opt, style = AppType.BodyStrong.copy(fontSize = 14.sp), color = if (isSel) Palette.OnSurface else Palette.Muted)
            }
        }
    }
}

@Composable
private fun WeekStrip(weekStart: LocalDate, selected: LocalDate, all: List<ProgramEvent>, onSelect: (LocalDate) -> Unit) {
    val busy = all.map { it.start.toLocalDate() }.toSet()
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
        Icon(Icons.Rounded.ChevronLeft, "Semana anterior", tint = Palette.Muted,
            modifier = Modifier.size(28.dp).clip(CircleShape).clickable { onSelect(selected.minusWeeks(1)) })
        (0..6).forEach { i ->
            val d = weekStart.plusDays(i.toLong())
            val isSel = d == selected
            val bg by animateColorAsState(if (isSel) Palette.Lime else Palette.Surface, label = "day")
            val fg = if (isSel) Palette.OnLime else Palette.OnSurface
            Column(
                modifier = Modifier.weight(1f).clip(RoundedCornerShape(16.dp)).background(bg)
                    .clickable(role = Role.Button) { onSelect(d) }
                    .semantics { contentDescription = "${d.weekdayLong()} ${d.dayOfMonth}" }
                    .padding(top = 10.dp, bottom = 8.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                Text(d.weekdayShort().take(1), style = AppType.Tab.copy(fontSize = 11.sp, fontWeight = FontWeight.SemiBold), color = fg.copy(alpha = 0.75f))
                Text(d.dayOfMonth.toString(), style = AppType.Headline.copy(fontSize = 17.sp), color = if (d == today() && !isSel) Palette.Lime else fg)
                Box(Modifier.size(5.dp).clip(CircleShape).background(when { d !in busy -> Color.Transparent; isSel -> Palette.OnLime; else -> Palette.Lime }))
            }
        }
        Icon(Icons.Rounded.ChevronRight, "Semana siguiente", tint = Palette.Muted,
            modifier = Modifier.size(28.dp).clip(CircleShape).clickable { onSelect(selected.plusWeeks(1)) })
    }
}

@Composable
private fun FormativeCard(all: List<ProgramEvent>) {
    val n = now()
    val total = all.size
    val done = all.count { (it.end ?: it.start) < n }
    Column(
        modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(28.dp)).background(Palette.Surface).padding(18.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        Text("Programa formativo", style = AppType.BodyStrong, color = Palette.OnSurface)
        Row(verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("$done", style = AppType.LargeTitle.copy(fontSize = 40.sp, lineHeight = 40.sp), color = Palette.OnSurface)
            Text("de $total sesiones completadas", style = AppType.Body.copy(fontSize = 15.sp), color = Palette.Muted, modifier = Modifier.padding(bottom = 4.dp))
        }
        val filled = if (total == 0) 0 else (done * 10 + total - 1) / total
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
            repeat(10) { i -> Box(Modifier.weight(1f).height(10.dp).clip(CircleShape).background(if (i < filled) Palette.Lime else Palette.SurfaceHighest)) }
        }
    }
}

@Composable
private fun TimelineRow(e: ProgramEvent) {
    val n = now()
    val end = e.end ?: e.start.plusHours(1)
    val live = !e.allDay && e.start <= n && end > n
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        Text(if (e.allDay) "Día" else e.start.hm(), style = AppType.Caption.copy(fontWeight = FontWeight.SemiBold), color = Palette.Muted,
            modifier = Modifier.width(48.dp).padding(top = 16.dp))
        Column(
            modifier = Modifier.weight(1f).clip(RoundedCornerShape(24.dp)).background(if (live) Palette.Lime else Palette.Surface).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            val fg = if (live) Palette.OnLime else Palette.OnSurface
            val sub = if (live) Palette.OnLime.copy(alpha = 0.8f) else Palette.Muted
            if (live) Pill("EN CURSO", bg = Palette.OnLime.copy(alpha = 0.14f), fg = Palette.OnLime)
            Text(e.title, style = AppType.Headline, color = fg)
            val info = listOfNotNull(e.location, if (e.allDay) null else "hasta ${end.hm()}").joinToString(" · ")
            if (info.isNotEmpty()) Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                Icon(Icons.Rounded.Place, null, tint = sub, modifier = Modifier.size(15.dp))
                Text(info, style = AppType.Caption.copy(fontWeight = FontWeight.Medium), color = sub)
            }
            e.who?.let { Text(it, style = AppType.Caption, color = sub) }
        }
    }
}

@Composable
private fun FreeRow(onExplore: () -> Unit) {
    Row(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(24.dp)).background(Palette.Surface).padding(16.dp),
        verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Column(Modifier.weight(1f)) {
            Text("Día libre", style = AppType.Headline, color = Palette.OnSurface)
            Text("Ideas cerca de ti en el mapa", style = AppType.Caption, color = Palette.Muted)
        }
        Text("Explorar", style = AppType.Caption.copy(fontWeight = FontWeight.SemiBold), color = Palette.OnSurface,
            modifier = Modifier.clip(CircleShape).background(Palette.SurfaceHigh).clickable(role = Role.Button, onClick = onExplore).padding(horizontal = 14.dp, vertical = 10.dp))
    }
}
