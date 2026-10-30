package es.almaaura.mierasmus.ui.screens

import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.Lock
import androidx.compose.material.icons.rounded.Refresh
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import es.almaaura.mierasmus.ui.components.Hairline
import es.almaaura.mierasmus.ui.components.Pill
import es.almaaura.mierasmus.ui.theme.AppType
import es.almaaura.mierasmus.ui.theme.Palette
import org.json.JSONArray
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.rememberCoroutineScope
import es.almaaura.mierasmus.data.Api
import kotlinx.coroutines.launch

/** Niveles y preguntas copiados de la web app (src/data/quizzes/spanish-levels.ts). */
data class QuizQuestion(val q: String, val explanation: String, val answers: List<String>, val correct: Int)
data class QuizLevel(val title: String, val description: String, val cefr: String, val passing: Int, val questions: List<QuizQuestion>)

private fun loadLevels(ctx: Context): List<QuizLevel> {
    val arr = JSONArray(ctx.assets.open("spanish_levels.json").bufferedReader().use { it.readText() })
    return (0 until arr.length()).map { i ->
        val o = arr.getJSONObject(i)
        val qs = o.getJSONArray("questions")
        QuizLevel(
            o.getString("title"), o.getString("description"), o.getString("level"), o.optInt("passingScore", 80),
            (0 until qs.length()).map { j ->
                val q = qs.getJSONObject(j)
                val a = q.getJSONArray("a")
                QuizQuestion(q.getString("q"), q.optString("exp"), (0 until a.length()).map { a.getString(it) }, q.getInt("c"))
            },
        )
    }
}

private const val PREFS = "cursos"
private fun Context.merge(unlocked: Int, best: Map<Int, Int>) {
    val p = getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    p.edit().apply {
        if (unlocked > p.getInt("unlocked", 1)) putInt("unlocked", unlocked)
        best.forEach { (i, s) -> if (s > p.getInt("best_$i", -1)) putInt("best_$i", s) }
    }.apply()
}
private fun Context.unlocked(): Int = getSharedPreferences(PREFS, Context.MODE_PRIVATE).getInt("unlocked", 1)
private fun Context.best(i: Int): Int = getSharedPreferences(PREFS, Context.MODE_PRIVATE).getInt("best_$i", -1)
private fun Context.saveResult(i: Int, score: Int, passed: Boolean) {
    val p = getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    p.edit().apply {
        if (score > p.getInt("best_$i", -1)) putInt("best_$i", score)
        if (passed && p.getInt("unlocked", 1) < i + 2) putInt("unlocked", i + 2)
    }.apply()
}

@Composable
fun CursosFlow(onBack: () -> Unit) {
    val ctx = LocalContext.current
    val levels = remember { loadLevels(ctx) }
    var playing by rememberSaveable { mutableStateOf<Int?>(null) }
    var refresh by remember { mutableIntStateOf(0) }
    val scope = rememberCoroutineScope()
    // Sincroniza con /api/cursos/progreso (se queda con la mejor nota de cada nivel)
    LaunchedEffect(Unit) {
        runCatching {
            val (unlocked, best) = Api.courseProgress()
            ctx.merge(unlocked, best); refresh++
        }
    }

    val current = playing
    if (current == null) {
        val unlocked = remember(refresh) { ctx.unlocked() }
        DetailScaffold("Cursos de español", onBack) {
            Text("${levels.size} niveles con cuestionarios. Aprueba con un ${levels.first().passing}% para desbloquear el siguiente.", style = AppType.Body, color = Palette.Muted)
            Card {
                levels.forEachIndexed { i, l ->
                    val open = i < unlocked
                    val best = remember(refresh) { ctx.best(i) }
                    ListRow(
                        l.title,
                        if (best >= 0) "${l.description} · Mejor: $best%" else l.description,
                        onClick = if (open) ({ playing = i }) else null,
                        leading = { Pill(l.cefr, bg = if (open) Palette.Lime else Palette.SurfaceHigh, fg = if (open) Palette.OnLime else Palette.Muted) },
                        trailing = {
                            when {
                                best >= l.passing -> Icon(Icons.Rounded.Check, "Completado", tint = Palette.Lime, modifier = Modifier.size(20.dp))
                                open -> Chevron()
                                else -> Icon(Icons.Rounded.Lock, "Bloqueado", tint = Palette.Subtle, modifier = Modifier.size(18.dp))
                            }
                        },
                    )
                    if (i < levels.lastIndex) Hairline()
                }
            }
        }
    } else {
        QuizScreen(
            level = levels[current],
            hasNext = current < levels.lastIndex,
            onExit = { playing = null; refresh++ },
            onFinish = { score, passed ->
                ctx.saveResult(current, score, passed)
                scope.launch { runCatching { Api.saveCourseProgress(ctx.unlocked(), (0 until levels.size).associateWith { ctx.best(it) }.filterValues { it >= 0 }, levels.first().passing) } }
            },
            onNext = { playing = current + 1; refresh++ },
        )
    }
}

@Composable
private fun QuizScreen(level: QuizLevel, hasNext: Boolean, onExit: () -> Unit, onFinish: (Int, Boolean) -> Unit, onNext: () -> Unit) {
    var index by rememberSaveable(level.title) { mutableIntStateOf(0) }
    var picked by rememberSaveable(level.title) { mutableStateOf<Int?>(null) }
    var correct by rememberSaveable(level.title) { mutableIntStateOf(0) }
    var done by rememberSaveable(level.title) { mutableStateOf(false) }
    val total = level.questions.size

    if (done) {
        val score = correct * 100 / total
        val passed = score >= level.passing
        DetailScaffold(level.title, onExit) {
            Column(
                Modifier.fillMaxWidth().clip(RoundedCornerShape(32.dp)).background(if (passed) Palette.Lime else Palette.Surface).padding(24.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                val fg = if (passed) Palette.OnLime else Palette.OnSurface
                Text(if (passed) "¡Nivel superado!" else "Casi lo tienes", style = AppType.Title, color = fg)
                Text("$score%", style = AppType.LargeTitle.copy(fontSize = 56.sp, lineHeight = 58.sp), color = fg)
                Text("$correct de $total respuestas correctas · necesitas ${level.passing}%", style = AppType.Body, color = fg.copy(alpha = 0.8f))
            }
            if (passed && hasNext) LimeButton("Siguiente nivel", onClick = onNext)
            if (!passed) LimeButton("Reintentar", Icons.Rounded.Refresh) { index = 0; picked = null; correct = 0; done = false }
            Box(
                Modifier.fillMaxWidth().height(52.dp).clip(CircleShape).background(Palette.Surface).clickable(role = Role.Button, onClick = onExit),
                contentAlignment = Alignment.Center,
            ) { Text("Volver a los niveles", style = AppType.BodyStrong, color = Palette.OnSurface) }
        }
        return
    }

    val q = level.questions[index]
    DetailScaffold(level.title, onExit) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            repeat(total) { i ->
                Box(Modifier.weight(1f).height(8.dp).clip(CircleShape).background(if (i <= index) Palette.Lime else Palette.SurfaceHighest))
            }
        }
        Text("Pregunta ${index + 1} de $total", style = AppType.Overline.copy(fontSize = 13.sp), color = Palette.Muted)
        Text(q.q, style = AppType.Section, color = Palette.OnSurface)

        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            q.answers.forEachIndexed { i, a ->
                val answered = picked != null
                val isRight = i == q.correct
                val isPicked = i == picked
                val bg = when {
                    answered && isRight -> Palette.Lime
                    answered && isPicked -> Color(0xFF5A1F24)
                    else -> Palette.Surface
                }
                val fg = if (answered && isRight) Palette.OnLime else Palette.OnSurface
                Row(
                    Modifier.fillMaxWidth().heightIn(min = 56.dp).clip(RoundedCornerShape(20.dp)).background(bg)
                        .then(if (!answered) Modifier.border(1.dp, Palette.SurfaceHighest, RoundedCornerShape(20.dp)) else Modifier)
                        .clickable(enabled = !answered, role = Role.Button) {
                            picked = i
                            if (isRight) correct++
                        }
                        .padding(horizontal = 18.dp, vertical = 14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    Text(a, style = AppType.Body.copy(fontSize = 17.sp), color = fg, modifier = Modifier.weight(1f))
                    if (answered && isRight) Icon(Icons.Rounded.Check, "Correcta", tint = Palette.OnLime)
                    if (answered && isPicked && !isRight) Icon(Icons.Rounded.Close, "Incorrecta", tint = Palette.Danger)
                }
            }
        }

        if (picked != null) {
            if (q.explanation.isNotBlank()) {
                Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).background(Palette.Surface).padding(16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Box(Modifier.size(4.dp, 40.dp).fillMaxHeight().clip(CircleShape).background(Palette.Sky))
                    Text(q.explanation, style = AppType.Body, color = Palette.Muted)
                }
            }
            LimeButton(if (index < total - 1) "Siguiente" else "Ver resultado") {
                if (index < total - 1) { index++; picked = null }
                else {
                    val score = correct * 100 / total
                    onFinish(score, score >= level.passing)
                    done = true
                }
            }
        }
    }
}
