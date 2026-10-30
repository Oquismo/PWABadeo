package es.almaaura.mierasmus.data

import java.time.LocalDate
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.time.format.TextStyle
import java.util.Locale

val ES: Locale = Locale.forLanguageTag("es-ES")
private val HM = DateTimeFormatter.ofPattern("HH:mm")
fun ZonedDateTime.hm(): String = format(HM)
fun LocalDate.weekdayShort(): String = dayOfWeek.getDisplayName(TextStyle.SHORT, ES).uppercase().trimEnd('.').take(3)
fun LocalDate.weekdayLong(): String = dayOfWeek.getDisplayName(TextStyle.FULL, ES).replaceFirstChar { it.uppercase() }
fun LocalDate.monthLong(): String = month.getDisplayName(TextStyle.FULL_STANDALONE, ES)
fun LocalDate.longLabel(): String = "${weekdayLong()}, $dayOfMonth de ${monthLong()}"
fun today(): LocalDate = LocalDate.now(Madrid)
fun now(): ZonedDateTime = ZonedDateTime.now(Madrid)
