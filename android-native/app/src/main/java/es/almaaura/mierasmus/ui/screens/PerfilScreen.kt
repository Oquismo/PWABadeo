package es.almaaura.mierasmus.ui.screens

import androidx.compose.foundation.Canvas
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
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.AccountBalanceWallet
import androidx.compose.material.icons.rounded.Checklist
import androidx.compose.material.icons.rounded.Edit
import androidx.compose.material.icons.rounded.Event
import androidx.compose.material.icons.rounded.Groups
import androidx.compose.material.icons.rounded.Hotel
import androidx.compose.material.icons.rounded.MenuBook
import androidx.compose.material.icons.rounded.PhotoLibrary
import androidx.compose.material.icons.rounded.Star
import androidx.compose.material.icons.rounded.ChatBubbleOutline
import androidx.compose.material.icons.rounded.ChevronRight
import androidx.compose.material.icons.rounded.Language
import androidx.compose.material.icons.rounded.Notifications
import androidx.compose.material.icons.rounded.Phone
import androidx.compose.material.icons.rounded.Schedule
import androidx.compose.material.icons.rounded.Shield
import androidx.compose.material3.Icon
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.runtime.rememberCoroutineScope
import es.almaaura.mierasmus.data.Api
import es.almaaura.mierasmus.data.User
import es.almaaura.mierasmus.ui.components.Session
import kotlinx.coroutines.launch
import es.almaaura.mierasmus.ui.components.BottomBarSpacer
import es.almaaura.mierasmus.ui.components.Hairline
import es.almaaura.mierasmus.ui.components.IconTile
import es.almaaura.mierasmus.ui.components.Pill
import es.almaaura.mierasmus.ui.theme.AppType
import es.almaaura.mierasmus.ui.theme.Palette

@Composable
fun PerfilScreen(onOpen: (Overlay) -> Unit) {
    val u = Session.user
    val scope = rememberCoroutineScope()
    var notif by rememberSaveable { mutableStateOf(true) }
    var reminders by rememberSaveable { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .verticalScroll(rememberScrollState())
            .padding(start = 20.dp, end = 20.dp, top = 16.dp),
        verticalArrangement = Arrangement.spacedBy(22.dp),
    ) {
        Text("Perfil", style = AppType.LargeTitle, color = Palette.OnSurface)

        ErasmusPass()

        Group("MIS DATOS") {
            InfoRow("Email", u?.email ?: "—")
            Hairline()
            InfoRow("Escuela", u?.schoolName ?: "Sin asignar")
            Hairline()
            InfoRow("Edad", u?.age?.let { "$it años" } ?: "No especificada")
            Hairline()
            InfoRow("Ubicación", listOfNotNull(u?.city, u?.country).joinToString(", ").ifBlank { "—" })
            Hairline()
            NavRow(Icons.Rounded.Edit, Palette.Lime, Palette.OnLime, "Editar perfil", onClick = { onOpen(Overlay.EditarPerfil) })
        }

        Group("MI ERASMUS") {
            NavRow(Icons.Rounded.MenuBook, Palette.Sky, Palette.OnSky, "Cursos de español", trailing = "10 niveles", onClick = { onOpen(Overlay.Cursos) })
            Hairline()
            NavRow(Icons.Rounded.Checklist, Palette.Lime, Palette.OnLime, "Checklist de llegada", onClick = { onOpen(Overlay.Checklist) })
            Hairline()
            NavRow(Icons.Rounded.Event, Palette.Amber, Palette.OnAmber, "Eventos", onClick = { onOpen(Overlay.Eventos) })
            Hairline()
            NavRow(Icons.Rounded.Hotel, Palette.Rose, Palette.OnRose, "Residencia", onClick = { onOpen(Overlay.Residencia) })
            Hairline()
            NavRow(Icons.Rounded.PhotoLibrary, Palette.Lilac, Palette.OnLilac, "Álbum", onClick = { onOpen(Overlay.Album) })
            Hairline()
            NavRow(Icons.Rounded.Groups, Palette.Sky, Palette.OnSky, "Comunidad", onClick = { onOpen(Overlay.Comunidad) })
            Hairline()
            NavRow(Icons.Rounded.Star, Palette.Orange, Palette.OnOrange, "Recomendaciones", onClick = { onOpen(Overlay.Recomendaciones) })
        }

        Group("PREFERENCIAS") {
            ToggleRow(Icons.Rounded.Notifications, Palette.Sky, Palette.OnSky, "Notificaciones", notif) { notif = it }
            Hairline()
            ToggleRow(Icons.Rounded.Schedule, Palette.Amber, Palette.OnAmber, "Recordatorios de eventos", reminders) { reminders = it }
            Hairline()
            NavRow(Icons.Rounded.Language, Palette.Lilac, Palette.OnLilac, "Idioma", trailing = "Español", onClick = { onOpen(Overlay.Ajustes) })
        }

        Group("AYUDA") {
            NavRow(Icons.Rounded.Phone, Palette.Orange, Palette.OnOrange, "Teléfonos útiles", badge = "112", onClick = { onOpen(Overlay.Telefonos) })
            Hairline()
            NavRow(Icons.Rounded.Shield, Palette.SurfaceHighest, Palette.OnSurface, "Privacidad", onClick = { onOpen(Overlay.Ajustes) })
            Hairline()
            NavRow(Icons.Rounded.ChatBubbleOutline, Palette.SurfaceHighest, Palette.OnSurface, "Enviar comentarios", onClick = { onOpen(Overlay.Ajustes) })
        }

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
                .clip(CircleShape)
                .background(Palette.Surface)
                .clickable(role = Role.Button) { scope.launch { Api.logout(); Session.user = null } },
            contentAlignment = Alignment.Center,
        ) {
            Text("Cerrar sesión", style = AppType.BodyStrong.copy(fontSize = 16.sp), color = Palette.Danger)
        }

        BottomBarSpacer()
        Spacer(Modifier.navigationBarsPadding())
    }
}

/** Pase Erasmus al estilo de tarjeta de Wallet. */
@Composable
private fun ErasmusPass() {
    val u = Session.user
    Box(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(32.dp)).background(Palette.Lime)
    ) {
        Canvas(Modifier.matchParentSize()) {
            val r = 86.dp.toPx()
            drawCircle(
                color = Palette.OnLime.copy(alpha = 0.08f),
                radius = r,
                center = Offset(size.width - 40.dp.toPx(), 40.dp.toPx()),
                style = Stroke(width = 28.dp.toPx()),
            )
        }
        Column(Modifier.padding(22.dp), verticalArrangement = Arrangement.spacedBy(22.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("PASE ERASMUS", style = AppType.Overline.copy(fontSize = 13.sp, letterSpacing = 1.sp), color = Palette.OnLime)
                Text("Sevilla · 2026/27", style = AppType.Caption.copy(fontWeight = FontWeight.SemiBold), color = Palette.OnLime)
            }
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                Box(
                    Modifier.size(60.dp).clip(RoundedCornerShape(22.dp)).background(Palette.OnLime),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(u?.fullName?.take(1)?.uppercase() ?: "?", style = AppType.Section.copy(fontWeight = FontWeight.ExtraBold), color = Palette.Lime)
                }
                Column {
                    Text(u?.fullName ?: "", style = AppType.Title.copy(fontSize = 24.sp), color = Palette.OnLime)
                    Text(u?.email ?: "", style = AppType.Body.copy(fontSize = 14.sp, fontWeight = FontWeight.Medium), color = Palette.OnLime.copy(alpha = 0.8f))
                }
            }
            Row(verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                PassField("ESCUELA", u?.schoolName ?: "—", Modifier.weight(1f))
                PassField("ESTANCIA", stay(u), Modifier.weight(1f))
                Box(
                    Modifier.size(72.dp).clip(RoundedCornerShape(16.dp)).background(Palette.OnSurface),
                    contentAlignment = Alignment.Center,
                ) {
                    Text("ID\n#${u?.id ?: ""}", style = AppType.Overline, color = Color(0xFF3F3F46), textAlign = androidx.compose.ui.text.style.TextAlign.Center)
                }
            }
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
                    .clip(CircleShape)
                    .background(Palette.OnLime)
                    .clickable(role = Role.Button) {},
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Icon(Icons.Rounded.AccountBalanceWallet, contentDescription = null, tint = Palette.OnSurface, modifier = Modifier.size(18.dp))
                Spacer(Modifier.size(8.dp))
                Text("Añadir a la cartera", style = AppType.BodyStrong, color = Palette.OnSurface)
            }
        }
    }
}

@Composable
private fun PassField(label: String, value: String, modifier: Modifier) {
    Column(modifier) {
        Text(label, style = AppType.Overline.copy(fontSize = 11.sp), color = Palette.OnLime.copy(alpha = 0.7f))
        Text(value, style = AppType.BodyStrong, color = Palette.OnLime)
    }
}

@Composable
private fun Group(title: String, content: @Composable ColumnScope.() -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(title, style = AppType.Overline.copy(fontSize = 13.sp), color = Palette.Muted, modifier = Modifier.padding(start = 16.dp))
        Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(24.dp)).background(Palette.Surface), content = content)
    }
}

@Composable
private fun ToggleRow(icon: ImageVector, bg: Color, fg: Color, label: String, checked: Boolean, onChange: (Boolean) -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = 56.dp)
            .clickable(role = Role.Switch) { onChange(!checked) }
            .padding(horizontal = 16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        IconTile(icon, bg = bg, fg = fg, size = 32.dp, shape = RoundedCornerShape(10.dp), iconSize = 18.dp)
        Text(label, style = AppType.Body, color = Palette.OnSurface, modifier = Modifier.weight(1f))
        Switch(
            checked = checked,
            onCheckedChange = null,
            colors = SwitchDefaults.colors(
                checkedTrackColor = Palette.Lime,
                checkedThumbColor = Palette.OnLime,
                checkedBorderColor = Palette.Lime,
                uncheckedTrackColor = Palette.SurfaceHighest,
                uncheckedThumbColor = Color(0xFFE4E4E7),
                uncheckedBorderColor = Palette.SurfaceHighest,
            ),
        )
    }
}

@Composable
private fun NavRow(icon: ImageVector, bg: Color, fg: Color, label: String, trailing: String? = null, badge: String? = null, onClick: () -> Unit = {}) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = 56.dp)
            .clickable(role = Role.Button, onClick = onClick)
            .padding(horizontal = 16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        IconTile(icon, bg = bg, fg = fg, size = 32.dp, shape = RoundedCornerShape(10.dp), iconSize = 18.dp)
        Text(label, style = AppType.Body, color = Palette.OnSurface, modifier = Modifier.weight(1f))
        if (trailing != null) Text(trailing, style = AppType.Body.copy(fontSize = 15.sp), color = Palette.Muted)
        if (badge != null) {
            Pill(badge, bg = Palette.Orange, fg = Palette.OnOrange)
        } else {
            Icon(Icons.Rounded.ChevronRight, contentDescription = null, tint = Palette.Subtle, modifier = Modifier.size(20.dp))
        }
    }
}

@Composable
private fun InfoRow(label: String, value: String) {
    Row(
        Modifier.fillMaxWidth().heightIn(min = 52.dp).padding(horizontal = 16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(label, style = AppType.Body, color = Palette.Muted)
        Text(value, style = AppType.Body, color = Palette.OnSurface)
    }
}

private fun stay(u: User?): String {
    fun f(s: String?) = s?.take(10)?.split("-")?.let { if (it.size == 3) "${it[2]}/${it[1]}" else null }
    val a = f(u?.arrival); val d = f(u?.departure)
    return if (a == null && d == null) "—" else "${a ?: "?"} – ${d ?: "?"}"
}
