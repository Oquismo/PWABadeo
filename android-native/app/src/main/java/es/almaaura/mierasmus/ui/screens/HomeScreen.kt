package es.almaaura.mierasmus.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.CalendarMonth
import androidx.compose.material.icons.rounded.ChevronRight
import androidx.compose.material.icons.rounded.NorthEast
import androidx.compose.material.icons.rounded.Notifications
import androidx.compose.material.icons.rounded.Phone
import androidx.compose.material.icons.rounded.Place
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import android.content.Context
import androidx.compose.runtime.remember
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.layout.ContentScale
import coil.compose.AsyncImage
import es.almaaura.mierasmus.data.Places
import androidx.compose.ui.platform.LocalContext
import es.almaaura.mierasmus.data.Api
import es.almaaura.mierasmus.data.ProgramEvent
import es.almaaura.mierasmus.data.hm
import es.almaaura.mierasmus.data.longLabel
import es.almaaura.mierasmus.data.now
import es.almaaura.mierasmus.data.today
import es.almaaura.mierasmus.data.weekdayLong
import es.almaaura.mierasmus.data.weekdayShort
import es.almaaura.mierasmus.ui.components.EmptyNote
import es.almaaura.mierasmus.ui.components.LoadView
import es.almaaura.mierasmus.ui.components.Session
import es.almaaura.mierasmus.ui.components.rememberLoad
import es.almaaura.mierasmus.data.SampleData
import es.almaaura.mierasmus.data.Spot
import es.almaaura.mierasmus.ui.components.BottomBarSpacer
import es.almaaura.mierasmus.ui.components.GlassIconButton
import es.almaaura.mierasmus.ui.components.Hairline
import es.almaaura.mierasmus.ui.components.IconTile
import es.almaaura.mierasmus.ui.components.Pill
import es.almaaura.mierasmus.ui.components.SectionHeader
import es.almaaura.mierasmus.ui.components.Tab
import es.almaaura.mierasmus.ui.theme.AppType
import es.almaaura.mierasmus.ui.theme.Palette

@Composable
fun HomeScreen(onNavigate: (Tab) -> Unit, onOpen: (Overlay) -> Unit) {
    val ctx = LocalContext.current
    val loader = rememberLoad { Api.schoolEvents(today(), today().plusDays(7)) }
    LazyColumn(
        modifier = Modifier.fillMaxSize().statusBarsPadding(),
        contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = 16.dp),
        verticalArrangement = Arrangement.spacedBy(24.dp),
    ) {
        item { Header(onBell = { onOpen(Overlay.Notificaciones) }) }
        item {
            LoadView(loader) { events ->
                val n = now()
                val current = events.firstOrNull { !it.allDay && it.start <= n && (it.end ?: it.start.plusHours(1)) > n }
                val next = events.firstOrNull { it.start > n }
                NowCard(current ?: next, live = current != null, onClick = { onNavigate(Tab.Programa) })
            }
        }
        item { Bento(onNavigate, onOpen, checklistProgress(ctx)) }
        item {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                SectionHeader("Próximos días", action = "Ver todo", onAction = { onNavigate(Tab.Programa) })
                LoadView(loader) { events ->
                    val upcoming = events.filter { it.start > now() }.take(4)
                    if (upcoming.isEmpty()) EmptyNote("No hay actividades del programa en los próximos 7 días.")
                    else Agenda(upcoming, onClick = { onNavigate(Tab.Programa) })
                }
            }
        }
        item {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                SectionHeader("Descubre Sevilla")
                LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(SampleData.spots) { SpotCard(it, onClick = { onOpen(Overlay.Lugar(it.name)) }) }
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
private fun Header(onBell: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Column(Modifier.weight(1f)) {
            Text(today().longLabel(), style = AppType.Body.copy(fontSize = 15.sp), color = Palette.Muted)
            Text("Hola, ${Session.user?.displayName ?: ""}", style = AppType.LargeTitle, color = Palette.OnSurface)
        }
        GlassIconButton(Icons.Rounded.Notifications, "Notificaciones", onClick = onBell, badge = Palette.Lime)
    }
}

/** Tarjeta "Ahora / Próximo" al estilo Live Activity, con datos del programa. */
@Composable
private fun NowCard(event: ProgramEvent?, live: Boolean, onClick: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(32.dp))
            .background(Palette.Lime)
            .clickable(role = Role.Button, onClick = onClick)
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        if (event == null) {
            Text("SIN ACTIVIDADES", style = AppType.Overline.copy(fontSize = 13.sp), color = Palette.OnLime)
            Text("Nada programado esta semana", style = AppType.Title, color = Palette.OnLime)
            return@Column
        }
        val end = event.end ?: event.start.plusHours(1)
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Box(Modifier.size(8.dp).clip(CircleShape).background(Palette.OnLime))
                val d = event.start.toLocalDate()
                Text(if (live) "AHORA" else if (d == today()) "HOY" else "${d.weekdayLong().uppercase()} ${d.dayOfMonth}", style = AppType.Overline.copy(fontSize = 13.sp), color = Palette.OnLime)
            }
            Text(if (event.allDay) "Todo el día" else "${event.start.hm()} – ${end.hm()}", style = AppType.Caption.copy(fontWeight = FontWeight.SemiBold), color = Palette.OnLime)
        }
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(event.title, style = AppType.Title, color = Palette.OnLime)
            event.location?.let { Text(it, style = AppType.BodyStrong.copy(fontWeight = FontWeight.Medium), color = Palette.OnLime.copy(alpha = 0.8f)) }
        }
        if (live) {
            val total = java.time.Duration.between(event.start, end).seconds.coerceAtLeast(1)
            val done = java.time.Duration.between(event.start, now()).seconds
            Box(Modifier.fillMaxWidth().height(8.dp).clip(CircleShape).background(Palette.OnLime.copy(alpha = 0.18f))) {
                Box(Modifier.fillMaxWidth((done.toFloat() / total).coerceIn(0f, 1f)).fillMaxHeight().clip(CircleShape).background(Palette.OnLime))
            }
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            val mins = java.time.Duration.between(now(), if (live) end else event.start).toMinutes()
            Text(
                when { live -> "Termina en $mins min"; mins < 60 -> "Empieza en $mins min"; mins < 1440 -> "Empieza en ${mins / 60} h"; else -> event.who ?: "" },
                style = AppType.Caption.copy(fontWeight = FontWeight.SemiBold), color = Palette.OnLime,
            )
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                Text("Ver programa", style = AppType.Caption.copy(fontWeight = FontWeight.SemiBold), color = Palette.OnLime)
                Icon(Icons.Rounded.NorthEast, contentDescription = null, tint = Palette.OnLime, modifier = Modifier.size(16.dp))
            }
        }
    }
}

/** Rejilla bento de accesos rápidos. */
@Composable
private fun Bento(onNavigate: (Tab) -> Unit, onOpen: (Overlay) -> Unit, checklist: Pair<Int, Int>) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Row(Modifier.fillMaxWidth().height(236.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            // Mapa (alto)
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight()
                    .clip(RoundedCornerShape(28.dp))
                    .background(Palette.Surface)
                    .clickable(role = Role.Button) { onNavigate(Tab.Mapa) },
            ) {
                MiniMap(Modifier.fillMaxSize())
                Column(
                    modifier = Modifier.fillMaxSize().padding(18.dp),
                    verticalArrangement = Arrangement.SpaceBetween,
                ) {
                    IconTile(Icons.Rounded.Place, bg = Palette.OnSurface, fg = Palette.Ground, size = 44.dp, shape = RoundedCornerShape(16.dp), iconSize = 22.dp)
                    Column {
                        Text("Mapa", style = AppType.Section, color = Palette.OnSurface)
                        Text("Sitios clave de Sevilla", style = AppType.Caption, color = Palette.Muted)
                    }
                }
            }
            Column(Modifier.weight(1f).fillMaxHeight(), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                SmallTile(
                    title = "Eventos",
                    bg = Palette.Surface, fg = Palette.OnSurface,
                    tile = { IconTile(Icons.Rounded.CalendarMonth, bg = Palette.SurfaceHigh, fg = Palette.Lime) },
                    modifier = Modifier.weight(1f),
                    onClick = { onOpen(Overlay.Eventos) },
                )
                SmallTile(
                    title = "Emergencias 112",
                    bg = Palette.Orange, fg = Palette.OnOrange,
                    tile = { IconTile(Icons.Rounded.Phone, bg = Palette.OnOrange.copy(alpha = 0.12f), fg = Palette.OnOrange, shape = CircleShape) },
                    modifier = Modifier.weight(1f),
                    onClick = { onOpen(Overlay.Telefonos) },
                )
            }
        }
        // Checklist (ancho completo)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(28.dp))
                .background(Palette.Surface)
                .clickable(role = Role.Button) { onOpen(Overlay.Checklist) }
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            ProgressRing(progress = checklist.first.toFloat() / checklist.second, label = "${checklist.first}/${checklist.second}")
            Column(Modifier.weight(1f)) {
                Text("Checklist de llegada", style = AppType.BodyStrong, color = Palette.OnSurface)
                Text("Empadronamiento, NIE, tarjeta de transporte", style = AppType.Caption, color = Palette.Muted)
            }
            Icon(Icons.Rounded.ChevronRight, contentDescription = null, tint = Palette.Subtle)
        }
    }
}

@Composable
private fun SmallTile(
    title: String,
    bg: Color,
    fg: Color,
    tile: @Composable () -> Unit,
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(28.dp))
            .background(bg)
            .clickable(role = Role.Button, onClick = onClick)
            .padding(16.dp),
        verticalArrangement = Arrangement.SpaceBetween,
    ) {
        tile()
        Text(title, style = AppType.BodyStrong, color = fg)
    }
}

@Composable
private fun ProgressRing(progress: Float, label: String) {
    Box(Modifier.size(48.dp), contentAlignment = Alignment.Center) {
        Canvas(Modifier.fillMaxSize()) {
            val stroke = 5.dp.toPx()
            drawArc(Palette.SurfaceHigh, 0f, 360f, false, style = Stroke(stroke))
            drawArc(Palette.Lime, -90f, 360f * progress, false, style = Stroke(stroke, cap = StrokeCap.Round))
        }
        Text(label, style = AppType.Tab.copy(fontWeight = FontWeight.SemiBold), color = Palette.OnSurface)
    }
}

/** Mapa decorativo para la tarjeta bento. */
@Composable
private fun MiniMap(modifier: Modifier) {
    Canvas(modifier) {
        val w = size.width
        val h = size.height
        val river = Path().apply {
            moveTo(-10f, h * 0.68f)
            cubicTo(w * 0.2f, h * 0.6f, w * 0.4f, h * 0.82f, w * 0.65f, h * 0.72f)
            cubicTo(w * 0.85f, h * 0.64f, w * 0.95f, h * 0.52f, w + 10f, h * 0.55f)
        }
        drawPath(river, Color(0x8C2F4A6B), style = Stroke(width = 16.dp.toPx(), cap = StrokeCap.Round))
        val street = Color(0x8C2C2C33)
        val sw = 4.dp.toPx()
        drawLine(street, Offset(w * 0.1f, 0f), Offset(w * 0.32f, h), sw)
        drawLine(street, Offset(0f, h * 0.3f), Offset(w, h * 0.17f), sw)
        drawLine(street, Offset(w * 0.58f, 0f), Offset(w * 0.8f, h), sw)
        drawLine(street, Offset(0f, h * 0.9f), Offset(w, h * 0.8f), sw)
    }
}

@Composable
private fun Agenda(items: List<ProgramEvent>, onClick: () -> Unit) {
    Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(24.dp)).background(Palette.Surface)) {
        items.forEachIndexed { i, item ->
            val d = item.start.toLocalDate()
            Row(
                modifier = Modifier.fillMaxWidth().clickable(role = Role.Button, onClick = onClick).padding(horizontal = 16.dp, vertical = 14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(14.dp),
            ) {
                Column(
                    modifier = Modifier.width(48.dp).height(52.dp).clip(RoundedCornerShape(14.dp)).background(Palette.SurfaceHigh),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center,
                ) {
                    Text(d.weekdayShort(), style = AppType.Tab.copy(fontSize = 11.sp, fontWeight = FontWeight.SemiBold), color = Palette.Muted)
                    Text(d.dayOfMonth.toString(), style = AppType.Headline.copy(fontSize = 19.sp), color = Palette.OnSurface)
                }
                Column(Modifier.weight(1f)) {
                    Text(item.title, style = AppType.BodyStrong, color = Palette.OnSurface)
                    Text(listOfNotNull(if (item.allDay) "Todo el día" else item.start.hm(), item.location).joinToString(" · "), style = AppType.Caption, color = Palette.Muted)
                }
            }
            if (i < items.lastIndex) Hairline()
        }
    }
}

@Composable
private fun SpotCard(spot: Spot, onClick: () -> Unit) {
    val ctx = LocalContext.current
    val img = remember { Places.byName(ctx, spot.name)?.imageUrl }
    Box(
        modifier = Modifier.width(220.dp).height(260.dp).clip(RoundedCornerShape(28.dp)).background(Color(spot.tint))
            .clickable(role = Role.Button, onClick = onClick),
    ) {
        if (img != null) AsyncImage(img, null, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize())
        Box(Modifier.fillMaxSize().background(Brush.verticalGradient(0.45f to Color.Transparent, 1f to Color.Black.copy(alpha = 0.8f))))
        Column(Modifier.align(Alignment.BottomStart).padding(16.dp)) {
            Text(spot.name, style = AppType.Section, color = Palette.OnSurface)
            Text(spot.subtitle, style = AppType.Caption, color = Color(spot.onTint))
        }
    }
}

fun checklistProgress(ctx: Context): Pair<Int, Int> {
    val done = ctx.getSharedPreferences("checklist", Context.MODE_PRIVATE).getStringSet("done", emptySet())!!
    return SampleData.checklist.count { it in done } to SampleData.checklist.size
}
