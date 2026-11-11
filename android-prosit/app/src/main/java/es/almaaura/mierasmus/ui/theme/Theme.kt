package es.almaaura.mierasmus.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp

/** Identidad Prosit+: fucsia y turquesa sobre superficies claras. */
object Palette {
    val Ground = Color(0xFFF3F8FA)
    val Surface = Color(0xFFFFFFFF)
    val SurfaceHigh = Color(0xFFE7F2F5)
    val SurfaceHighest = Color(0xFFC9DCE2)
    val OnSurface = Color(0xFF173440)
    val Muted = Color(0xFF4D6873)
    val Subtle = Color(0xFF607A85)
    val Primary = Color(0xFFD50848)
    val OnPrimary = Color(0xFFFFFFFF)
    val Secondary = Color(0xFF007F98)
    val OnSecondary = Color(0xFFFFFFFF)
    val Sky = Color(0xFFD3F3FA)
    val OnSky = Color(0xFF005F73)
    val Rose = Color(0xFFFCE3EC)
    val OnRose = Color(0xFF9C0B3C)
    val Amber = Color(0xFFFFEBCB)
    val OnAmber = Color(0xFF714600)
    val Lilac = Color(0xFFE0F3F5)
    val OnLilac = Color(0xFF006570)
    val Danger = Color(0xFFB42338)
    val GlassFill = Color(0xF5FFFFFF)
    val GlassStroke = Color(0xFFD4E5EA)
}

/**
 * Tipografía. El diseño usa Bricolage Grotesque (títulos) y Geist (texto).
 * Para usarlas, copia los .ttf a app/src/main/res/font/ y cambia estas dos familias,
 * p. ej. FontFamily(Font(R.font.bricolage_extrabold, FontWeight.ExtraBold)).
 */
val DisplayFamily: FontFamily = FontFamily.SansSerif
val BodyFamily: FontFamily = FontFamily.SansSerif

object AppType {
    val LargeTitle = TextStyle(fontFamily = DisplayFamily, fontWeight = FontWeight.ExtraBold, fontSize = 34.sp, lineHeight = 36.sp, letterSpacing = (-0.03).em)
    val Title = TextStyle(fontFamily = DisplayFamily, fontWeight = FontWeight.ExtraBold, fontSize = 26.sp, lineHeight = 29.sp, letterSpacing = (-0.02).em)
    val Section = TextStyle(fontFamily = DisplayFamily, fontWeight = FontWeight.Bold, fontSize = 22.sp, lineHeight = 26.sp, letterSpacing = (-0.02).em)
    val Headline = TextStyle(fontFamily = BodyFamily, fontWeight = FontWeight.SemiBold, fontSize = 17.sp, lineHeight = 22.sp)
    val Body = TextStyle(fontFamily = BodyFamily, fontWeight = FontWeight.Normal, fontSize = 16.sp, lineHeight = 21.sp)
    val BodyStrong = TextStyle(fontFamily = BodyFamily, fontWeight = FontWeight.SemiBold, fontSize = 15.sp, lineHeight = 20.sp)
    val Caption = TextStyle(fontFamily = BodyFamily, fontWeight = FontWeight.Normal, fontSize = 13.sp, lineHeight = 17.sp)
    val Overline = TextStyle(fontFamily = BodyFamily, fontWeight = FontWeight.SemiBold, fontSize = 12.sp, lineHeight = 16.sp, letterSpacing = 0.06.em)
    val Tab = TextStyle(fontFamily = BodyFamily, fontWeight = FontWeight.Medium, fontSize = 10.5.sp, lineHeight = 12.sp)
}

private val scheme = lightColorScheme(
    primary = Palette.Primary,
    onPrimary = Palette.OnPrimary,
    secondary = Palette.Secondary,
    onSecondary = Palette.OnSecondary,
    background = Palette.Ground,
    onBackground = Palette.OnSurface,
    surface = Palette.Surface,
    onSurface = Palette.OnSurface,
    surfaceVariant = Palette.SurfaceHigh,
    onSurfaceVariant = Palette.Muted,
    outline = Palette.Subtle,
    outlineVariant = Palette.SurfaceHighest,
    primaryContainer = Palette.Rose,
    onPrimaryContainer = Palette.OnRose,
    secondaryContainer = Palette.Sky,
    onSecondaryContainer = Palette.OnSky,
    surfaceContainer = Palette.SurfaceHigh,
    error = Palette.Danger,
    onError = Palette.OnPrimary,
)

@Composable
fun MiErasmusTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = scheme, content = content)
}
