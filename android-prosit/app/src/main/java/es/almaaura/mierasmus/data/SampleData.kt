package es.almaaura.mierasmus.data

/*
 * Datos de ejemplo para la maqueta. Los textos entre corchetes son marcadores:
 * se sustituirán por datos reales cuando conectemos el backend (API de Next.js).
 */

data class AgendaItem(val weekday: String, val day: Int, val title: String, val subtitle: String)

data class Spot(val name: String, val subtitle: String, val tint: Long, val onTint: Long)

data class Session(
    val time: String,
    val title: String,
    val place: String,
    val live: Boolean = false,
    val free: Boolean = false,
)

data class WeekDay(val letter: String, val name: String, val day: Int, val busy: Boolean)

object SampleData {
    const val userName = "[Nombre]"
    const val todayLabel = "Martes, 6 de octubre"

    val nowTitle = "Clase de español B1"
    val nowPlace = "[Aula] · [Escuela]"
    val nowTime = "09:30 – 11:00"
    val nowProgress = 0.62f

    val week = listOf(
        AgendaItem("MIÉ", 7, "Visita al Real Alcázar", "11:00 · Punto de encuentro [lugar]"),
        AgendaItem("JUE", 8, "Intercambio de idiomas", "19:00 · [Lugar]"),
        AgendaItem("SÁB", 10, "Ruta por Barrio Santa Cruz", "10:30 · Comunidad"),
    )

    val spots = listOf(
        Spot("Plaza de España", "Parque de María Luisa", 0xFF3B2A1E, 0xFFE4D4C8),
        Spot("Real Alcázar", "Patrimonio de la Humanidad", 0xFF1F3328, 0xFFCDE0D4),
        Spot("Barrio Santa Cruz", "Antigua judería", 0xFF22293F, 0xFFD0D5E6),
    )

    val days = listOf(
        WeekDay("L", "Lunes", 5, true),
        WeekDay("M", "Martes", 6, true),
        WeekDay("X", "Miércoles", 7, true),
        WeekDay("J", "Jueves", 8, true),
        WeekDay("V", "Viernes", 9, false),
        WeekDay("S", "Sábado", 10, true),
        WeekDay("D", "Domingo", 11, false),
    )
    const val today = 6

    val sessions = listOf(
        Session("09:30", "Clase de español B1", "[Aula] · hasta 11:00", live = true),
        Session("12:00", "Taller: vida en Sevilla", "[Lugar] · 1 h"),
        Session("17:00", "Tarde libre", "Ideas cerca de ti en el mapa", free = true),
    )

    val mapFilters = listOf("Cultura", "Comer", "Transporte", "Farmacias", "Fiesta")

    data class Notif(val title: String, val subtitle: String, val unread: Boolean)
    data class Event(val title: String, val date: String, val place: String)
    data class Level(val title: String, val description: String, val cefr: String)

    val notifications = listOf(
        Notif("Visita al Real Alcázar mañana", "Recordatorio · 11:00", true),
        Notif("Nuevo evento: Intercambio de idiomas", "Comunidad · jueves 19:00", true),
        Notif("Ruta por Barrio Santa Cruz", "Sábado 10:30", false),
    )

    val events = listOf(
        Event("Intercambio de idiomas", "Jue 8 · 19:00", "[Lugar]"),
        Event("Ruta por Barrio Santa Cruz", "Sáb 10 · 10:30", "[Punto de encuentro]"),
    )

    // Mismos niveles que src/data/quizzes/spanish-levels.ts de la web app
    val spanishLevels = listOf(
        Level("Nivel 1: Fundamentos", "Presente simple y vocabulario básico", "A1"),
        Level("Nivel 2: Rutinas Diarias", "Verbos reflexivos y rutinas", "A2"),
        Level("Nivel 3: Pasado Simple", "Pretérito perfecto simple", "A2"),
        Level("Nivel 4: Futuro Simple", "Hablar sobre el futuro", "B1"),
        Level("Nivel 5: Subjuntivo Presente", "Deseos y dudas", "B1"),
        Level("Nivel 6: Condicional", "Situaciones hipotéticas", "B2"),
        Level("Nivel 7: Expresiones", "Modismos y frases hechas", "B2"),
        Level("Nivel 8: Subjuntivo Imperfecto", "[Descripción]", "B2"),
        Level("Nivel 9: Preposiciones Avanzadas", "[Descripción]", "C1"),
        Level("Nivel 10: Maestría", "[Descripción]", "C1"),
    )

    val checklist = listOf(
        "Empadronamiento", "NIE / TIE", "Tarjeta de transporte", "Cuenta bancaria", "Tarjeta sanitaria", "Seguro médico",
    )

    // Mismos teléfonos que la web app (src/app/telefonos)
    val phones = listOf(
        "Emergencias" to listOf("Emergencias generales" to "112", "Policía Local" to "092", "Guardia Civil" to "062"),
        "Programa AMRO" to listOf("Coordinador del programa" to "+34 649 347 760", "Secretaría AMRO" to "+34 954 000 000"),
        "Servicios locales" to listOf(
            "Centro de Salud Norte" to "+34 954 111 222",
            "Ayuntamiento de Sevilla" to "+34 955 470 000",
            "EMT Sevilla (Bus)" to "+34 900 010 059",
        ),
    )
}
