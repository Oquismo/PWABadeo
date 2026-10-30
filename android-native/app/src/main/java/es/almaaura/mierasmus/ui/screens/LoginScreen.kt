package es.almaaura.mierasmus.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Place
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.remember
import androidx.compose.foundation.layout.heightIn
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import es.almaaura.mierasmus.data.Api
import es.almaaura.mierasmus.ui.components.Session
import es.almaaura.mierasmus.ui.components.openUrl
import es.almaaura.mierasmus.ui.theme.AppType
import es.almaaura.mierasmus.ui.theme.Palette
import kotlinx.coroutines.launch

@Composable
fun fieldColors() = OutlinedTextFieldDefaults.colors(
    focusedBorderColor = Palette.Lime, unfocusedBorderColor = Palette.SurfaceHighest,
    focusedLabelColor = Palette.Lime, unfocusedLabelColor = Palette.Muted, cursorColor = Palette.Lime,
    focusedTextColor = Palette.OnSurface, unfocusedTextColor = Palette.OnSurface,
)

@Composable
fun LoginScreen() {
    var mode by rememberSaveable { mutableStateOf("login") }
    androidx.activity.compose.BackHandler(enabled = mode != "login") { mode = "login" }
    when (mode) {
        "registro" -> RegisterScreen(onBack = { mode = "login" })
        "olvido" -> ForgotScreen(onBack = { mode = "login" })
        else -> LoginForm(onRegister = { mode = "registro" }, onForgot = { mode = "olvido" })
    }
}

@Composable
private fun LoginForm(onRegister: () -> Unit, onForgot: () -> Unit) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    var email by rememberSaveable { mutableStateOf("") }
    var pass by rememberSaveable { mutableStateOf("") }
    var loading by rememberSaveable { mutableStateOf(false) }
    var error by rememberSaveable { mutableStateOf<String?>(null) }

    Column(
        Modifier.fillMaxSize().background(Palette.Ground).systemBarsPadding().imePadding().verticalScroll(rememberScrollState()).padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Box(Modifier.padding(top = 48.dp).size(64.dp).clip(RoundedCornerShape(22.dp)).background(Palette.Lime), contentAlignment = Alignment.Center) {
            Icon(Icons.Rounded.Place, null, tint = Palette.OnLime, modifier = Modifier.size(32.dp))
        }
        Text("Mi Erasmus", style = AppType.LargeTitle.copy(fontSize = 40.sp, lineHeight = 42.sp), color = Palette.OnSurface)
        Text("Inicia sesión con tu cuenta de la web app.", style = AppType.Body, color = Palette.Muted)
        OutlinedTextField(
            email, { email = it }, label = { Text("Email") }, singleLine = true, colors = fieldColors(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email), shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            pass, { pass = it }, label = { Text("Contraseña") }, singleLine = true, colors = fieldColors(),
            visualTransformation = PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password), shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth(),
        )
        error?.let { Text(it, style = AppType.Body, color = Palette.Danger) }
        val enabled = email.isNotBlank() && pass.isNotBlank() && !loading
        Row(
            Modifier.fillMaxWidth().height(54.dp).clip(CircleShape).background(if (enabled) Palette.Lime else Palette.SurfaceHigh)
                .clickable(enabled = enabled, role = Role.Button) {
                    loading = true; error = null
                    scope.launch {
                        try { Session.user = Api.login(email, pass) } catch (e: Exception) { error = e.message ?: "Sin conexión" }
                        loading = false
                    }
                },
            horizontalArrangement = Arrangement.Center, verticalAlignment = Alignment.CenterVertically,
        ) {
            if (loading) CircularProgressIndicator(color = Palette.OnLime, strokeWidth = 2.dp, modifier = Modifier.size(22.dp))
            else Text("Entrar", style = AppType.BodyStrong.copy(fontSize = 16.sp), color = if (enabled) Palette.OnLime else Palette.Muted)
        }
        Text("¿Olvidaste la contraseña?", style = AppType.BodyStrong, color = Palette.Lime,
            modifier = Modifier.clickable(role = Role.Button, onClick = onForgot).padding(vertical = 8.dp))
        Text("¿No tienes cuenta? Regístrate", style = AppType.BodyStrong, color = Palette.OnSurface,
            modifier = Modifier.clickable(role = Role.Button, onClick = onRegister).padding(vertical = 8.dp))
    }
}

@Composable
private fun AuthScaffold(title: String, subtitle: String, onBack: () -> Unit, content: @Composable androidx.compose.foundation.layout.ColumnScope.() -> Unit) {
    Column(
        Modifier.fillMaxSize().background(Palette.Ground).systemBarsPadding().imePadding().verticalScroll(rememberScrollState()).padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        Text("‹ Volver", style = AppType.BodyStrong, color = Palette.Lime, modifier = Modifier.clickable(role = Role.Button, onClick = onBack).padding(vertical = 8.dp))
        Text(title, style = AppType.LargeTitle, color = Palette.OnSurface)
        Text(subtitle, style = AppType.Body, color = Palette.Muted)
        content()
    }
}

@Composable
private fun PrimaryButton(text: String, enabled: Boolean, loading: Boolean, onClick: () -> Unit) {
    Row(
        Modifier.fillMaxWidth().height(54.dp).clip(CircleShape).background(if (enabled) Palette.Lime else Palette.SurfaceHigh)
            .clickable(enabled = enabled && !loading, role = Role.Button, onClick = onClick),
        horizontalArrangement = Arrangement.Center, verticalAlignment = Alignment.CenterVertically,
    ) {
        if (loading) CircularProgressIndicator(color = Palette.OnLime, strokeWidth = 2.dp, modifier = Modifier.size(22.dp))
        else Text(text, style = AppType.BodyStrong.copy(fontSize = 16.sp), color = if (enabled) Palette.OnLime else Palette.Muted)
    }
}

@Composable
private fun Field(value: String, onChange: (String) -> Unit, label: String, type: KeyboardType = KeyboardType.Text, password: Boolean = false) {
    OutlinedTextField(
        value, onChange, label = { Text(label) }, singleLine = true, colors = fieldColors(),
        visualTransformation = if (password) PasswordVisualTransformation() else androidx.compose.ui.text.input.VisualTransformation.None,
        keyboardOptions = KeyboardOptions(keyboardType = type), shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth(),
    )
}

@Composable
private fun RegisterScreen(onBack: () -> Unit) {
    val scope = rememberCoroutineScope()
    var first by rememberSaveable { mutableStateOf("") }
    var last by rememberSaveable { mutableStateOf("") }
    var email by rememberSaveable { mutableStateOf("") }
    var pass by rememberSaveable { mutableStateOf("") }
    var age by rememberSaveable { mutableStateOf("") }
    var country by rememberSaveable { mutableStateOf("") }
    var city by rememberSaveable { mutableStateOf("") }
    var schoolId by rememberSaveable { mutableStateOf<Int?>(null) }
    var residence by rememberSaveable { mutableStateOf<String?>(null) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    val schools = es.almaaura.mierasmus.ui.components.rememberLoad { Api.schools() }

    AuthScaffold("Crear cuenta", "Regístrate para acceder al programa de tu escuela.", onBack) {
        Field(first, { first = it }, "Nombre")
        Field(last, { last = it }, "Apellidos")
        Field(email, { email = it }, "Email", KeyboardType.Email)
        Field(pass, { pass = it }, "Contraseña (mín. 6 caracteres)", KeyboardType.Password, password = true)
        Field(age, { age = it.filter(Char::isDigit).take(3) }, "Edad", KeyboardType.Number)
        Field(country, { country = it }, "País")
        Field(city, { city = it }, "Ciudad")

        Text("ESCUELA", style = AppType.Overline, color = Palette.Muted)
        es.almaaura.mierasmus.ui.components.LoadView(schools) { list ->
            var expanded by remember { mutableStateOf(false) }
            val current = list.firstOrNull { it.id == schoolId }
            Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(Palette.Surface)) {
                Text(current?.name ?: "Elige tu escuela", style = AppType.Body, color = if (current == null) Palette.Muted else Palette.OnSurface,
                    modifier = Modifier.fillMaxWidth().clickable { expanded = !expanded }.padding(16.dp))
                if (expanded) Column(Modifier.heightIn(max = 280.dp).verticalScroll(rememberScrollState())) {
                    list.forEach { s ->
                        Text(s.name + (s.country?.let { " · $it" } ?: ""), style = AppType.Body, color = Palette.OnSurface,
                            modifier = Modifier.fillMaxWidth().clickable { schoolId = s.id; expanded = false }.padding(horizontal = 16.dp, vertical = 12.dp))
                    }
                }
            }
        }

        Text("RESIDENCIA", style = AppType.Overline, color = Palette.Muted)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf("ONE", "AMRO", "ESTANISLAO").forEach { r ->
                val sel = residence == r
                Text(r, style = AppType.BodyStrong.copy(fontSize = 14.sp), color = if (sel) Palette.OnLime else Palette.OnSurface,
                    modifier = Modifier.clip(CircleShape).background(if (sel) Palette.Lime else Palette.Surface)
                        .clickable { residence = if (sel) null else r }.padding(horizontal = 16.dp, vertical = 10.dp))
            }
        }

        error?.let { Text(it, style = AppType.Body, color = Palette.Danger) }
        val ok = first.isNotBlank() && email.contains("@") && pass.length >= 6
        PrimaryButton("Crear cuenta", ok, loading) {
            loading = true; error = null
            scope.launch {
                try { Session.user = Api.register(first.trim(), last.trim(), email, pass, age, schoolId, residence, country.trim(), city.trim()) }
                catch (e: Exception) { error = e.message ?: "Sin conexión" }
                loading = false
            }
        }
    }
}

@Composable
private fun ForgotScreen(onBack: () -> Unit) {
    val scope = rememberCoroutineScope()
    var email by rememberSaveable { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }
    var msg by remember { mutableStateOf<String?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    AuthScaffold("Recuperar contraseña", "Te enviaremos un email con un enlace para crear una nueva.", onBack) {
        Field(email, { email = it }, "Email", KeyboardType.Email)
        msg?.let { Text(it, style = AppType.Body, color = Palette.Lime) }
        error?.let { Text(it, style = AppType.Body, color = Palette.Danger) }
        PrimaryButton("Enviar enlace", email.contains("@"), loading) {
            loading = true; error = null
            scope.launch {
                try { msg = Api.forgotPassword(email) } catch (e: Exception) { error = e.message ?: "Sin conexión" }
                loading = false
            }
        }
    }
}
