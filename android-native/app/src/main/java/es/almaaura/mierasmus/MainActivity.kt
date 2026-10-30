package es.almaaura.mierasmus

import android.graphics.Color as AndroidColor
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.runtime.remember
import es.almaaura.mierasmus.ui.screens.Overlay
import es.almaaura.mierasmus.ui.screens.OverlayScreen
import es.almaaura.mierasmus.ui.screens.LoginScreen
import es.almaaura.mierasmus.ui.components.Session
import es.almaaura.mierasmus.data.Api
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import es.almaaura.mierasmus.ui.components.GlassTabBar
import es.almaaura.mierasmus.ui.components.Tab
import es.almaaura.mierasmus.ui.screens.HomeScreen
import es.almaaura.mierasmus.ui.screens.MapaScreen
import es.almaaura.mierasmus.ui.screens.PerfilScreen
import es.almaaura.mierasmus.ui.screens.ProgramaScreen
import es.almaaura.mierasmus.ui.theme.MiErasmusTheme
import es.almaaura.mierasmus.ui.theme.Palette

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.dark(AndroidColor.TRANSPARENT),
            navigationBarStyle = SystemBarStyle.dark(AndroidColor.TRANSPARENT),
        )
        super.onCreate(savedInstanceState)
        Api.init(this)
        Session.user = Api.user
        setContent {
            MiErasmusTheme { if (Session.user == null) LoginScreen() else App() }
        }
    }
}

@Composable
private fun App() {
    var tab by rememberSaveable { mutableStateOf(Tab.Inicio) }
    var overlayKey by rememberSaveable { mutableStateOf<String?>(null) }
    val overlay = Overlay.fromKey(overlayKey)
    val open: (Overlay) -> Unit = { overlayKey = it.key }
    val goMap: () -> Unit = { overlayKey = null; tab = Tab.Mapa }

    BackHandler(enabled = overlay != null || tab != Tab.Inicio) {
        if (overlay != null) overlayKey = null else tab = Tab.Inicio
    }

    Box(Modifier.fillMaxSize().background(Palette.Ground)) {
        AnimatedContent(
            targetState = tab,
            transitionSpec = { fadeIn(tween(220)) togetherWith fadeOut(tween(160)) },
            label = "screens",
        ) { current ->
            when (current) {
                Tab.Inicio -> HomeScreen(onNavigate = { tab = it }, onOpen = open)
                Tab.Programa -> ProgramaScreen(onNavigate = { tab = it })
                Tab.Mapa -> MapaScreen()
                Tab.Perfil -> PerfilScreen(onOpen = open)
                Tab.Admin -> es.almaaura.mierasmus.ui.screens.AdminScreen()
            }
        }
        GlassTabBar(
            current = tab,
            onSelect = { tab = it },
            onSearch = { open(Overlay.Buscar) },
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .navigationBarsPadding()
                .padding(bottom = 12.dp),
        )
        AnimatedVisibility(
            visible = overlay != null,
            enter = slideInHorizontally { it } + fadeIn(),
            exit = slideOutHorizontally { it } + fadeOut(),
        ) {
            val shown = remember { mutableStateOf(overlay) }
            if (overlay != null) shown.value = overlay
            shown.value?.let { OverlayScreen(it, onBack = { overlayKey = null }, open = open, openMap = goMap) }
        }
    }
}
