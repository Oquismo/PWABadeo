package es.almaaura.mierasmus.ui.components

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import es.almaaura.mierasmus.data.AuthExpired
import es.almaaura.mierasmus.data.User
import es.almaaura.mierasmus.ui.theme.AppType
import es.almaaura.mierasmus.ui.theme.Palette

/** Estado global de sesión. Si la API devuelve sesión caducada, se vuelve al login. */
object Session {
    var user by mutableStateOf<User?>(null)
}

sealed interface Load<out T> {
    data object Loading : Load<Nothing>
    data class Ok<T>(val value: T) : Load<T>
    data class Err(val message: String) : Load<Nothing>
}

class Loader<T>(val state: Load<T>, val reload: () -> Unit)

@Composable
fun <T> rememberLoad(vararg keys: Any?, block: suspend () -> T): Loader<T> {
    var tick by remember { mutableIntStateOf(0) }
    var state by remember(*keys) { mutableStateOf<Load<T>>(Load.Loading) }
    LaunchedEffect(tick, *keys) {
        if (state !is Load.Ok) state = Load.Loading
        state = try {
            Load.Ok(block())
        } catch (e: AuthExpired) {
            Session.user = null; Load.Err("Sesión caducada")
        } catch (e: Exception) {
            Load.Err(e.message ?: "Sin conexión")
        }
    }
    return Loader(state) { tick++ }
}

/** Muestra carga / error / contenido. */
@Composable
fun <T> LoadView(loader: Loader<T>, content: @Composable (T) -> Unit) {
    when (val s = loader.state) {
        Load.Loading -> Box(Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = Palette.Lime, strokeWidth = 3.dp, modifier = Modifier.size(32.dp))
        }
        is Load.Err -> Column(
            Modifier.fillMaxWidth().clip(RoundedCornerShape(24.dp)).background(Palette.Surface).padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text("No se pudo cargar: ${s.message}", style = AppType.Body, color = Palette.Muted)
            Text(
                "Reintentar", style = AppType.BodyStrong, color = Palette.OnLime,
                modifier = Modifier.clip(CircleShape).background(Palette.Lime).clickable(role = Role.Button, onClick = loader.reload)
                    .padding(horizontal = 18.dp, vertical = 10.dp),
            )
        }
        is Load.Ok -> content(s.value)
    }
}

@Composable
fun EmptyNote(text: String) {
    Box(Modifier.fillMaxWidth().clip(RoundedCornerShape(24.dp)).background(Palette.Surface).padding(20.dp)) {
        Text(text, style = AppType.Body, color = Palette.Muted)
    }
}

fun Context.openUrl(url: String) {
    runCatching { startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url))) }
}
