package es.almaaura.mierasmus.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.AdminPanelSettings
import androidx.compose.material.icons.rounded.CalendarMonth
import androidx.compose.material.icons.rounded.Home
import androidx.compose.material.icons.rounded.Map
import androidx.compose.material.icons.rounded.Person
import androidx.compose.material.icons.rounded.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import es.almaaura.mierasmus.ui.theme.AppType
import es.almaaura.mierasmus.ui.theme.Palette

enum class Tab(val label: String, val icon: ImageVector) {
    Inicio("Inicio", Icons.Rounded.Home),
    Programa("Programa", Icons.Rounded.CalendarMonth),
    Mapa("Mapa", Icons.Rounded.Map),
    Perfil("Perfil", Icons.Rounded.Person),
    Admin("Admin", Icons.Rounded.AdminPanelSettings),
}

/** Superficie translúcida con borde y brillo superior, al estilo "Liquid Glass". */
fun Modifier.glass(shape: Shape, fill: Color = Palette.GlassFill): Modifier = this
    .shadow(elevation = 18.dp, shape = shape, ambientColor = Color.Black, spotColor = Color.Black)
    .clip(shape)
    .background(fill)
    .background(
        Brush.verticalGradient(
            0f to Color.White.copy(alpha = 0.10f),
            0.45f to Color.Transparent,
        )
    )
    .border(1.dp, Palette.GlassStroke, shape)

/** Barra de pestañas flotante + botón de búsqueda separado (patrón iOS 26 / M3 Expressive). */
@Composable
fun GlassTabBar(
    current: Tab,
    onSelect: (Tab) -> Unit,
    onSearch: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier.fillMaxWidth().padding(horizontal = 16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Row(
            modifier = Modifier
                .weight(1f)
                .height(64.dp)
                .glass(CircleShape)
                .padding(horizontal = 5.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Tab.entries.filter { it != Tab.Admin || Session.user?.role == "admin" }.forEach { tab ->
                TabItem(tab = tab, selected = tab == current, onClick = { onSelect(tab) })
            }
        }
        Box(
            modifier = Modifier
                .size(64.dp)
                .glass(CircleShape)
                .clickable(role = Role.Button, onClick = onSearch)
                .semantics { contentDescription = "Buscar" },
            contentAlignment = Alignment.Center,
        ) {
            Icon(Icons.Rounded.Search, contentDescription = null, tint = Palette.OnSurface, modifier = Modifier.size(24.dp))
        }
    }
}

@Composable
private fun RowScope.TabItem(tab: Tab, selected: Boolean, onClick: () -> Unit) {
    val bg by animateColorAsState(if (selected) Color.White.copy(alpha = 0.12f) else Color.Transparent, label = "tabBg")
    val fg by animateColorAsState(if (selected) Palette.Lime else Color(0xFFC9C9D1), label = "tabFg")
    Column(
        modifier = Modifier
            .weight(1f)
            .height(54.dp)
            .clip(CircleShape)
            .background(bg)
            .clickable(role = Role.Tab, onClick = onClick),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Icon(tab.icon, contentDescription = null, tint = fg, modifier = Modifier.size(22.dp))
        Spacer(Modifier.height(3.dp))
        Text(tab.label, style = AppType.Tab, color = fg, textAlign = TextAlign.Center, maxLines = 1)
    }
}

/** Botón circular de icono con efecto glass. */
@Composable
fun GlassIconButton(
    icon: ImageVector,
    description: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    size: Dp = 48.dp,
    badge: Color? = null,
) {
    Box(
        modifier = modifier
            .size(size)
            .glass(CircleShape)
            .clickable(role = Role.Button, onClick = onClick)
            .semantics { contentDescription = description },
        contentAlignment = Alignment.Center,
    ) {
        Icon(icon, contentDescription = null, tint = Palette.OnSurface, modifier = Modifier.size(22.dp))
        if (badge != null) {
            Box(
                Modifier
                    .align(Alignment.TopEnd)
                    .padding(top = 11.dp, end = 12.dp)
                    .size(10.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF26262C))
                    .padding(2.dp)
                    .clip(CircleShape)
                    .background(badge)
            )
        }
    }
}

/** Contenedor de icono con forma redondeada. */
@Composable
fun IconTile(
    icon: ImageVector,
    bg: Color,
    fg: Color,
    modifier: Modifier = Modifier,
    size: Dp = 40.dp,
    shape: Shape = RoundedCornerShape(14.dp),
    iconSize: Dp = 20.dp,
) {
    Box(
        modifier = modifier.size(size).clip(shape).background(bg),
        contentAlignment = Alignment.Center,
    ) {
        Icon(icon, contentDescription = null, tint = fg, modifier = Modifier.size(iconSize))
    }
}

/** Píldora / chip de texto. */
@Composable
fun Pill(text: String, bg: Color, fg: Color, modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .clip(CircleShape)
            .background(bg)
            .padding(horizontal = 10.dp, vertical = 4.dp),
    ) {
        Text(text, style = AppType.Overline, color = fg)
    }
}

/** Separador fino para listas agrupadas. */
@Composable
fun Hairline() {
    Box(Modifier.fillMaxWidth().height(1.dp).background(Palette.SurfaceHigh))
}

@Composable
fun SectionHeader(title: String, action: String? = null, onAction: () -> Unit = {}) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(title, style = AppType.Section, color = Palette.OnSurface)
        if (action != null) {
            Text(
                action,
                style = AppType.BodyStrong,
                color = Palette.Lime,
                modifier = Modifier
                    .clip(CircleShape)
                    .clickable(role = Role.Button, onClick = onAction)
                    .padding(horizontal = 8.dp, vertical = 6.dp),
            )
        }
    }
}

/** Espacio inferior para que el contenido no quede bajo la barra flotante. */
@Composable
fun BottomBarSpacer() {
    Spacer(Modifier.height(130.dp).width(1.dp))
}
