package es.almaaura.mierasmus.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp

/** Paleta del rediseño (lienzo "Mi Erasmus — Rediseño app 2026"). */
object Palette {
    val Ground = Color(0xFF0B0B0D)
    val Surface = Color(0xFF1C1C21)
    val SurfaceHigh = Color(0xFF2A2A31)
    val SurfaceHighest = Color(0xFF3A3A42)
    val OnSurface = Color(0xFFF4F4F5)
    val Muted = Color(0xFFA1A1AA)
    val Subtle = Color(0xFF71717A)
    val Lime = Color(0xFFC4F278)
    val OnLime = Color(0xFF142300)
    val Orange = Color(0xFFFF9F5A)
    val OnOrange = Color(0xFF2B1300)
    val Sky = Color(0xFF7DD3FC)
    val OnSky = Color(0xFF0B2530)
    val Rose = Color(0xFFFDA4AF)
    val OnRose = Color(0xFF3B0A12)
    val Amber = Color(0xFFFCD34D)
    val OnAmber = Color(0xFF3A2A00)
    val Lilac = Color(0xFFC4B5FD)
    val OnLilac = Color(0xFF1E1240)
    val Danger = Color(0xFFFCA5A5)
    val GlassFill = Color(0x9426262C)
    val GlassStroke = Color(0x1FFFFFFF)
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

private val scheme = darkColorScheme(
    primary = Palette.Lime,
    onPrimary = Palette.OnLime,
    secondary = Palette.Orange,
    onSecondary = Palette.OnOrange,
    background = Palette.Ground,
    onBackground = Palette.OnSurface,
    surface = Palette.Surface,
    onSurface = Palette.OnSurface,
    surfaceVariant = Palette.SurfaceHigh,
    onSurfaceVariant = Palette.Muted,
    outline = Palette.SurfaceHighest,
)

@Composable
fun MiErasmusTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = scheme, content = content)
}
