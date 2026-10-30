package es.almaaura.mierasmus.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material.icons.rounded.Call
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.ChevronRight
import androidx.compose.material.icons.rounded.Lock
import androidx.compose.material.icons.rounded.Map
import androidx.compose.material.icons.rounded.Search
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import es.almaaura.mierasmus.data.SampleData
import es.almaaura.mierasmus.ui.components.Hairline
import es.almaaura.mierasmus.ui.components.Pill
import es.almaaura.mierasmus.ui.components.glass
import es.almaaura.mierasmus.ui.theme.AppType
import es.almaaura.mierasmus.ui.theme.Palette

/** Pantallas secundarias que se abren encima de las pestañas. */
sealed class Overlay(val key: String) {
    data object Notificaciones : Overlay("notif")
    data object Buscar : Overlay("buscar")
    data object Eventos : Overlay("eventos")
    data object Cursos : Overlay("cursos")
    data object Checklist : Overlay("checklist")
    data object Telefonos : Overlay("telefonos")
    data object Residencia : Overlay("residencia")
    data object Album : Overlay("album")
    data object Comunidad : Overlay("comunidad")
    data object Recomendaciones : Overlay("recomendaciones")
    data object EditarPerfil : Overlay("editar")
    data object Ajustes : Overlay("ajustes")
    data class Lugar(val name: String) : Overlay("lugar:$name")

    companion object {
        private val all = listOf(Notificaciones, Buscar, Eventos, Cursos, Checklist, Telefonos, Residencia, Album, Comunidad, Recomendaciones, EditarPerfil, Ajustes)
        fun fromKey(k: String?): Overlay? = when {
            k == null -> null
            k.startsWith("lugar:") -> Lugar(k.removePrefix("lugar:"))
            else -> all.firstOrNull { it.key == k }
        }
    }
}

@Composable
fun OverlayScreen(overlay: Overlay, onBack: () -> Unit, open: (Overlay) -> Unit, openMap: () -> Unit) {
    when (overlay) {
        Overlay.Notificaciones -> NotificacionesScreen(onBack, open)
        Overlay.Buscar -> BuscarScreen(onBack, open, openMap)
        Overlay.Eventos -> EventosScreen(onBack)
        Overlay.Cursos -> CursosFlow(onBack)
        Overlay.Checklist -> ChecklistScreen(onBack)
        Overlay.Telefonos -> TelefonosScreen(onBack)
        is Overlay.Lugar -> LugarScreen(overlay.name, onBack, openMap)
        Overlay.Residencia -> ResidenciaScreen(onBack)
        Overlay.Album -> AlbumScreen(onBack)
        Overlay.Comunidad -> ComunidadScreen(onBack)
        Overlay.Recomendaciones -> RecomendacionesScreen(onBack)
        Overlay.EditarPerfil -> EditarPerfilScreen(onBack)
        Overlay.Ajustes -> AjustesScreen(onBack)
    }
}

// ---------- Estructura común ----------

@Composable
internal fun DetailScaffold(title: String, onBack: () -> Unit, action: (@Composable () -> Unit)? = null, content: @Composable ColumnScope.() -> Unit) {
    Column(
        Modifier.fillMaxSize().background(Palette.Ground).statusBarsPadding().verticalScroll(rememberScrollState())
            .padding(start = 20.dp, end = 20.dp, top = 8.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp),
    ) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
            Box(
                Modifier.size(48.dp).glass(CircleShape).clickable(role = Role.Button, onClick = onBack).semantics { contentDescription = "Atrás" },
                contentAlignment = Alignment.Center,
            ) { Icon(Icons.Rounded.ArrowBack, null, tint = Palette.OnSurface) }
            action?.invoke()
        }
        Text(title, style = AppType.LargeTitle, color = Palette.OnSurface)
        content()
        Spacer(Modifier.height(24.dp).navigationBarsPadding())
    }
}

@Composable
internal fun Card(content: @Composable ColumnScope.() -> Unit) {
    Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(24.dp)).background(Palette.Surface), content = content)
}

@Composable
internal fun ListRow(title: String, subtitle: String? = null, onClick: (() -> Unit)? = null, leading: (@Composable () -> Unit)? = null, trailing: (@Composable () -> Unit)? = null) {
    Row(
        Modifier.fillMaxWidth().heightIn(min = 60.dp)
            .then(if (onClick != null) Modifier.clickable(role = Role.Button, onClick = onClick) else Modifier)
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        leading?.invoke()
        Column(Modifier.weight(1f)) {
            Text(title, style = AppType.BodyStrong, color = Palette.OnSurface)
            if (subtitle != null) Text(subtitle, style = AppType.Caption, color = Palette.Muted)
        }
        trailing?.invoke()
    }
}

@Composable
internal fun Chevron() = Icon(Icons.Rounded.ChevronRight, null, tint = Palette.Subtle, modifier = Modifier.size(20.dp))

@Composable
internal fun LimeButton(text: String, icon: androidx.compose.ui.graphics.vector.ImageVector? = null, onClick: () -> Unit) {
    Row(
        Modifier.fillMaxWidth().height(52.dp).clip(CircleShape).background(Palette.Lime).clickable(role = Role.Button, onClick = onClick),
        horizontalArrangement = Arrangement.Center, verticalAlignment = Alignment.CenterVertically,
    ) {
        if (icon != null) { Icon(icon, null, tint = Palette.OnLime, modifier = Modifier.size(20.dp)); Spacer(Modifier.size(8.dp)) }
        Text(text, style = AppType.BodyStrong.copy(fontSize = 16.sp), color = Palette.OnLime)
    }
}

// ---------- Buscar ----------

@Composable
private fun BuscarScreen(onBack: () -> Unit, open: (Overlay) -> Unit, openMap: () -> Unit) {
    var q by rememberSaveable { mutableStateOf("") }
    val focus = remember { FocusRequester() }
    LaunchedEffect(Unit) { focus.requestFocus() }
    val index: List<Pair<String, () -> Unit>> = listOf(
        "Eventos" to { open(Overlay.Eventos) },
        "Cursos de español" to { open(Overlay.Cursos) },
        "Checklist de llegada" to { open(Overlay.Checklist) },
        "Teléfonos útiles" to { open(Overlay.Telefonos) },
        "Mapa" to openMap,
        "Residencia" to { open(Overlay.Residencia) },
        "Álbum" to { open(Overlay.Album) },
        "Comunidad" to { open(Overlay.Comunidad) },
        "Recomendaciones" to { open(Overlay.Recomendaciones) },
    ) + SampleData.spots.map { s -> s.name to { open(Overlay.Lugar(s.name)) } } +
        es.almaaura.mierasmus.data.Places.all(LocalContext.current).filter { p -> SampleData.spots.none { it.name == p.name } }
            .map { p -> p.name to { es.almaaura.mierasmus.data.Places.focusId = p.id; openMap() } }
    val results = index.filter { q.isBlank() || it.first.contains(q.trim(), ignoreCase = true) }

    DetailScaffold("Buscar", onBack) {
        Row(
            Modifier.fillMaxWidth().height(52.dp).glass(CircleShape).padding(horizontal = 18.dp),
            verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Icon(Icons.Rounded.Search, null, tint = Palette.Muted, modifier = Modifier.size(20.dp))
            Box(Modifier.weight(1f)) {
                if (q.isEmpty()) Text("Lugares, eventos, secciones…", style = AppType.Body, color = Palette.Muted)
                BasicTextField(
                    q, { q = it }, singleLine = true,
                    textStyle = AppType.Body.copy(color = Palette.OnSurface), cursorBrush = SolidColor(Palette.Lime),
                    modifier = Modifier.fillMaxWidth().focusRequester(focus).semantics { contentDescription = "Buscar" },
                )
            }
        }
        if (results.isEmpty()) Text("Sin resultados para \"$q\"", style = AppType.Body, color = Palette.Muted)
        else Card {
            results.forEachIndexed { i, (label, action) ->
                ListRow(label, onClick = action, trailing = { Chevron() })
                if (i < results.lastIndex) Hairline()
            }
        }
    }
}

// ---------- Teléfonos (datos de la web app) ----------

@Composable
private fun TelefonosScreen(onBack: () -> Unit) {
    val ctx = LocalContext.current
    DetailScaffold("Teléfonos útiles", onBack) {
        SampleData.phones.forEach { (group, list) ->
            Text(group.uppercase(), style = AppType.Overline.copy(fontSize = 13.sp), color = Palette.Muted, modifier = Modifier.padding(start = 16.dp))
            Card {
                list.forEachIndexed { i, (name, num) ->
                    ListRow(name, num, onClick = {
                        ctx.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:" + num.replace(" ", ""))))
                    }, trailing = {
                        Box(Modifier.size(40.dp).clip(CircleShape).background(if (num.length <= 3) Palette.Orange else Palette.SurfaceHigh), contentAlignment = Alignment.Center) {
                            Icon(Icons.Rounded.Call, "Llamar", tint = if (num.length <= 3) Palette.OnOrange else Palette.Lime, modifier = Modifier.size(20.dp))
                        }
                    })
                    if (i < list.lastIndex) Hairline()
                }
            }
        }
    }
}

// ---------- Lugar (Descubre Sevilla) ----------

@Composable
private fun LugarScreen(name: String, onBack: () -> Unit, openMap: () -> Unit) {
    val ctx = LocalContext.current
    val spot = SampleData.spots.firstOrNull { it.name == name } ?: SampleData.spots.first()
    val place = remember { es.almaaura.mierasmus.data.Places.byName(ctx, spot.name) }
    DetailScaffold(spot.name, onBack) {
        Box(Modifier.fillMaxWidth().height(240.dp).clip(RoundedCornerShape(32.dp)).background(Color(spot.tint))) {
            place?.imageUrl?.let { coil.compose.AsyncImage(it, spot.name, contentScale = androidx.compose.ui.layout.ContentScale.Crop, modifier = Modifier.fillMaxSize()) }
        }
        Text(spot.subtitle, style = AppType.Headline, color = Color(spot.onTint))
        place?.let {
            Text(it.desc, style = AppType.Body, color = Color(0xFFD4D4D8))
            it.address?.let { a -> Text(a, style = AppType.Caption, color = Palette.Muted) }
        }
        LimeButton("Ver en el mapa", Icons.Rounded.Map) { es.almaaura.mierasmus.data.Places.focusId = place?.id; openMap() }
        if (place != null) Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            listOf("Cómo llegar" to { ctx.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(place.directionsUrl))) }, "Compartir" to { ctx.sharePlace(place) }).forEach { (l, f) ->
                Box(Modifier.weight(1f).height(52.dp).clip(CircleShape).background(Palette.Surface).clickable(role = Role.Button, onClick = f), contentAlignment = Alignment.Center) {
                    Text(l, style = AppType.BodyStrong, color = Palette.OnSurface)
                }
            }
        }
    }
}
