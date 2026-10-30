package es.almaaura.mierasmus.ui.screens

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.drawable.GradientDrawable
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
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
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Bookmark
import androidx.compose.material.icons.rounded.BookmarkBorder
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.Directions
import androidx.compose.material.icons.rounded.MyLocation
import androidx.compose.material.icons.rounded.OpenInNew
import androidx.compose.material.icons.rounded.Search
import androidx.compose.material.icons.rounded.Share
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import coil.compose.AsyncImage
import es.almaaura.mierasmus.data.MapPlace
import es.almaaura.mierasmus.data.Places
import es.almaaura.mierasmus.ui.components.GlassIconButton
import es.almaaura.mierasmus.ui.components.glass
import es.almaaura.mierasmus.ui.components.openUrl
import es.almaaura.mierasmus.ui.theme.AppType
import es.almaaura.mierasmus.ui.theme.Palette
import org.osmdroid.config.Configuration
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Marker
import org.osmdroid.views.overlay.TilesOverlay
import org.osmdroid.views.overlay.mylocation.GpsMyLocationProvider
import org.osmdroid.views.overlay.mylocation.MyLocationNewOverlay

private val SEVILLA = GeoPoint(37.3826, -5.9930)

private fun dot(color: Int, sizePx: Int) = GradientDrawable().apply {
    shape = GradientDrawable.OVAL
    setColor(color)
    setStroke(sizePx / 7, android.graphics.Color.parseColor("#0B0B0D"))
    setSize(sizePx, sizePx)
}

private fun hasLocation(ctx: Context) =
    ContextCompat.checkSelfPermission(ctx, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
        ContextCompat.checkSelfPermission(ctx, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED

@Composable
fun MapaScreen() {
    val ctx = LocalContext.current
    val places = remember { Places.all(ctx) }
    var filter by rememberSaveable { mutableStateOf("Todos") }
    var query by rememberSaveable { mutableStateOf("") }
    var selectedId by rememberSaveable { mutableStateOf<String?>(Places.focusId) }
    var savedIds by remember { mutableStateOf(Places.saved(ctx)) }
    val selected = places.firstOrNull { it.id == selectedId }

    val cats = Places.filters.first { it.first == filter }.second
    val visible = places.filter { p ->
        (cats.isEmpty() || (cats.contains("__saved") && p.id in savedIds) || p.category in cats) &&
            (query.isBlank() || p.name.contains(query.trim(), true) || p.category.contains(query.trim(), true))
    }

    Configuration.getInstance().apply {
        userAgentValue = ctx.packageName
        osmdroidBasePath = ctx.cacheDir
        osmdroidTileCache = ctx.cacheDir.resolve("tiles")
    }
    val map = remember {
        MapView(ctx).apply {
            setTileSource(TileSourceFactory.MAPNIK)
            setMultiTouchControls(true)
            zoomController.setVisibility(org.osmdroid.views.CustomZoomButtonsController.Visibility.NEVER)
            overlayManager.tilesOverlay.setColorFilter(TilesOverlay.INVERT_COLORS)
            controller.setZoom(14.5)
            controller.setCenter(SEVILLA)
        }
    }
    val myLocation = remember { MyLocationNewOverlay(GpsMyLocationProvider(ctx), map) }
    val lifecycle = LocalLifecycleOwner.current.lifecycle
    DisposableEffect(lifecycle) {
        val obs = LifecycleEventObserver { _, e ->
            if (e == Lifecycle.Event.ON_RESUME) map.onResume()
            if (e == Lifecycle.Event.ON_PAUSE) map.onPause()
        }
        lifecycle.addObserver(obs)
        onDispose { lifecycle.removeObserver(obs); myLocation.disableMyLocation() }
    }
    val permLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { res ->
        if (res.values.any { it }) {
            if (myLocation !in map.overlays) map.overlays.add(myLocation)
            myLocation.enableMyLocation()
            myLocation.runOnFirstFix { map.post { myLocation.myLocation?.let { map.controller.animateTo(it) } } }
        }
    }
    LaunchedEffect(Unit) {
        if (hasLocation(ctx)) { map.overlays.add(myLocation); myLocation.enableMyLocation() }
        Places.focusId?.let { id ->
            places.firstOrNull { it.id == id }?.let { map.controller.setZoom(16.5); map.controller.setCenter(GeoPoint(it.lat, it.lng)) }
            Places.focusId = null
        }
    }

    // Marcadores
    val lime = Palette.Lime.toArgb()
    val white = Palette.OnSurface.toArgb()
    val density = ctx.resources.displayMetrics.density
    LaunchedEffect(visible, selectedId) {
        map.overlays.removeAll { it is Marker }
        visible.forEach { p ->
            val sel = p.id == selectedId
            map.overlays.add(Marker(map).apply {
                position = GeoPoint(p.lat, p.lng)
                title = p.name
                icon = dot(if (sel) lime else white, ((if (sel) 30 else 20) * density).toInt())
                setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_CENTER)
                setOnMarkerClickListener { _, _ -> selectedId = p.id; true }
            })
        }
        map.invalidate()
    }

    Box(Modifier.fillMaxSize().background(Color(0xFF16161A))) {
        AndroidView({ map }, Modifier.fillMaxSize())

        // Buscador + filtros
        Column(Modifier.fillMaxWidth().statusBarsPadding().padding(top = 12.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(
                Modifier.padding(horizontal = 16.dp).fillMaxWidth().height(52.dp).glass(CircleShape).padding(start = 18.dp, end = 12.dp),
                verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                Icon(Icons.Rounded.Search, null, tint = Color(0xFFC9C9D1), modifier = Modifier.size(20.dp))
                Box(Modifier.weight(1f)) {
                    if (query.isEmpty()) Text("Buscar en Sevilla", style = AppType.Body, color = Color(0xFFC9C9D1))
                    BasicTextField(query, { query = it; selectedId = null }, singleLine = true, textStyle = AppType.Body.copy(color = Palette.OnSurface),
                        cursorBrush = SolidColor(Palette.Lime), modifier = Modifier.fillMaxWidth().semantics { contentDescription = "Buscar en Sevilla" })
                }
                if (query.isNotEmpty()) Icon(Icons.Rounded.Close, "Borrar", tint = Palette.Muted, modifier = Modifier.size(20.dp).clickable { query = "" })
            }
            LazyRow(contentPadding = PaddingValues(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(Places.filters.map { it.first }) { label ->
                    val sel = label == filter
                    Box(
                        Modifier.height(40.dp).then(if (sel) Modifier.clip(CircleShape).background(Palette.Lime) else Modifier.glass(CircleShape))
                            .clickable(role = Role.Button) { filter = label; selectedId = null }.padding(horizontal = 16.dp),
                        contentAlignment = Alignment.Center,
                    ) { Text(label, style = AppType.BodyStrong.copy(fontSize = 14.sp), color = if (sel) Palette.OnLime else Palette.OnSurface) }
                }
            }
            // Resultados de búsqueda
            if (query.isNotBlank() && selected == null) {
                LazyColumn(Modifier.padding(horizontal = 16.dp).fillMaxWidth().heightIn(max = 280.dp).glass(RoundedCornerShape(24.dp), fill = Color(0xEB1C1C21))) {
                    if (visible.isEmpty()) item { Text("Sin resultados", style = AppType.Body, color = Palette.Muted, modifier = Modifier.padding(16.dp)) }
                    items(visible) { p ->
                        Column(Modifier.fillMaxWidth().clickable {
                            selectedId = p.id; map.controller.animateTo(GeoPoint(p.lat, p.lng)); map.controller.setZoom(16.5)
                        }.padding(horizontal = 16.dp, vertical = 12.dp)) {
                            Text(p.name, style = AppType.BodyStrong, color = Palette.OnSurface)
                            Text(p.category, style = AppType.Caption, color = Palette.Muted)
                        }
                    }
                }
            }
        }

        Column(Modifier.align(Alignment.BottomCenter).fillMaxWidth(), horizontalAlignment = Alignment.End) {
            GlassIconButton(Icons.Rounded.MyLocation, "Centrar en mi ubicación", onClick = {
                if (hasLocation(ctx)) {
                    if (myLocation !in map.overlays) map.overlays.add(myLocation)
                    myLocation.enableMyLocation()
                    myLocation.myLocation?.let { map.controller.animateTo(it) } ?: map.controller.animateTo(SEVILLA)
                } else permLauncher.launch(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION))
            }, modifier = Modifier.padding(end = 16.dp, bottom = 12.dp))
            if (selected != null) PlaceSheet(
                selected, saved = selected.id in savedIds,
                onClose = { selectedId = null },
                onSave = { Places.toggleSaved(ctx, selected.id); savedIds = Places.saved(ctx) },
            ) else Spacer(Modifier.height(100.dp).navigationBarsPadding())
        }
    }
}

fun Context.sharePlace(p: MapPlace) {
    val text = "${p.name}" + (p.address?.let { "\n$it" } ?: "") + "\n${p.mapsUrl}"
    startActivity(Intent.createChooser(Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, text), "Compartir lugar"))
}

@Composable
private fun PlaceSheet(p: MapPlace, saved: Boolean, onClose: () -> Unit, onSave: () -> Unit) {
    val ctx = LocalContext.current
    Column(
        Modifier.padding(horizontal = 8.dp).padding(bottom = 8.dp).fillMaxWidth().heightIn(max = 460.dp)
            .glass(RoundedCornerShape(40.dp), fill = Color(0xEB1C1C21))
            .verticalScroll(rememberScrollState())
            .padding(start = 20.dp, end = 20.dp, top = 10.dp).navigationBarsPadding().padding(bottom = 96.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        Box(Modifier.align(Alignment.CenterHorizontally).width(40.dp).height(5.dp).clip(CircleShape).background(Color(0xFF52525B)))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(p.name, style = AppType.Title.copy(fontSize = 26.sp, lineHeight = 29.sp), color = Palette.OnSurface)
                Text(listOfNotNull(p.category, p.address).joinToString(" · "), style = AppType.Body.copy(fontSize = 14.sp), color = Palette.Muted)
            }
            Box(
                Modifier.size(36.dp).clip(CircleShape).background(Palette.SurfaceHighest).clickable(role = Role.Button, onClick = onClose).semantics { contentDescription = "Cerrar" },
                contentAlignment = Alignment.Center,
            ) { Icon(Icons.Rounded.Close, null, tint = Color(0xFFD4D4D8), modifier = Modifier.size(18.dp)) }
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            SheetAction(Icons.Rounded.Directions, "Cómo llegar", Palette.Lime, Palette.OnLime, Modifier.weight(1f)) { ctx.openUrl(p.directionsUrl) }
            SheetAction(if (saved) Icons.Rounded.Bookmark else Icons.Rounded.BookmarkBorder, if (saved) "Guardado" else "Guardar",
                if (saved) Palette.OnSurface else Palette.SurfaceHigh, if (saved) Palette.Ground else Palette.OnSurface, Modifier.weight(1f), onSave)
            SheetAction(Icons.Rounded.Share, "Compartir", Palette.SurfaceHigh, Palette.OnSurface, Modifier.weight(1f)) { ctx.sharePlace(p) }
        }
        p.imageUrl?.let {
            AsyncImage(it, p.name, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxWidth().height(170.dp).clip(RoundedCornerShape(24.dp)).background(Palette.SurfaceHigh))
        }
        if (p.desc.isNotBlank()) Text(p.desc, style = AppType.Body, color = Color(0xFFD4D4D8))
        p.link?.let { url ->
            Row(Modifier.clip(CircleShape).clickable { ctx.openUrl(url) }.padding(vertical = 6.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                Icon(Icons.Rounded.OpenInNew, null, tint = Palette.Lime, modifier = Modifier.size(16.dp))
                Text("Web oficial", style = AppType.BodyStrong, color = Palette.Lime)
            }
        }
    }
}

@Composable
private fun SheetAction(icon: ImageVector, label: String, bg: Color, fg: Color, modifier: Modifier, onClick: () -> Unit) {
    Column(
        modifier = modifier.height(58.dp).clip(RoundedCornerShape(20.dp)).background(bg).clickable(role = Role.Button, onClick = onClick),
        horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center,
    ) {
        Icon(icon, contentDescription = null, tint = fg, modifier = Modifier.size(20.dp))
        Text(label, style = AppType.Tab.copy(fontSize = 12.sp, fontWeight = FontWeight.SemiBold), color = fg)
    }
}
