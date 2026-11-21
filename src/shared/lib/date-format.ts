import {
  format,
  isToday,
  isValid,
  isYesterday,
  parse,
  parseISO,
  type Locale,
} from "date-fns"
import { enUS } from "date-fns/locale/en-US"
import { es } from "date-fns/locale/es"

import { DEFAULT_LOCALE } from "@/src/shared/constants/locales"

/**
 * Every date the app shows is formatted here, with the locale of the profile.
 * Nothing fixes `es` on its own: a screen passes the locale it already has.
 */
const DATE_LOCALES: Record<string, Locale> = {
  es,
  "es-DO": es,
  "es-ES": es,
  en: enUS,
  "en-US": enUS,
}

/**
 * El perfil guarda el locale como texto libre y la copia de la app está en
 * español, así que un idioma sin formato propio se pinta en español en vez de
 * romper la pantalla. Es el único punto de resolución: ninguna otra función
 * elige un idioma por su cuenta.
 */
const FALLBACK_DATE_LOCALE = es

function dateLocale(locale: string): Locale {
  return DATE_LOCALES[locale] ?? FALLBACK_DATE_LOCALE
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/** Abreviaturas de mes en español; ICU escribe "sept" en septiembre. */
const MONTH_ABBREVIATIONS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
] as const

export function shortMonthLabel(date: Date, locale: string): string {
  if (locale.startsWith("es")) {
    return MONTH_ABBREVIATIONS[date.getMonth()] ?? ""
  }
  return format(date, "MMM", { locale: dateLocale(locale) }).toLowerCase()
}

/** `4 oct` */
export function formatDayMonth(date: Date, locale: string): string {
  if (!isValid(date)) {
    return ""
  }
  return `${format(date, "d")} ${shortMonthLabel(date, locale)}`
}

/** `4 oct 2026` */
export function formatDayMonthYear(date: Date, locale: string): string {
  if (!isValid(date)) {
    return ""
  }
  return `${formatDayMonth(date, locale)} ${format(date, "yyyy")}`
}

/** `Octubre 2026` */
export function formatMonthYearLabel(date: Date, locale: string): string {
  return capitalize(format(date, "MMMM yyyy", { locale: dateLocale(locale) }))
}

/** `Miércoles 14 Oct.` */
export function formatDayHeaderLabel(date: Date, locale: string): string {
  const resolved = dateLocale(locale)
  const weekdayLabel = capitalize(format(date, "EEEE", { locale: resolved }))
  const day = format(date, "d")
  const monthLabel = capitalize(shortMonthLabel(date, locale))
  return `${weekdayLabel} ${day} ${monthLabel}.`
}

/** `jun 01 - 07` */
export function formatWeekRangeLabel({
  start,
  end,
  locale,
}: {
  start: Date
  end: Date
  locale: string
}): string {
  const startMonth = shortMonthLabel(start, locale)
  const endMonth = shortMonthLabel(end, locale)
  const startDay = format(start, "dd")
  const endDay = format(end, "dd")

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}`
  }

  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`
}

const TIME_API_FORMAT = "HH:mm"

const TIME_DISPLAY_FORMAT = "hh:mm aaaa"

const TIME_REFERENCE_DATE = new Date(2000, 0, 1, 0, 0, 0, 0)

const TIME_PARSE_PATTERNS_12H = [
  "hh:mm aaaa",
  "h:mm aaaa",
  "hh:mm aaa",
  "h:mm aaa",
  "hh:mm a",
  "h:mm a",
] as const

/** Patrones de entrada en español: `10:00 p.m.`, `10:00 pm`, `10:00 p. m.` */
const TIME_INPUT_12H_REGEX =
  /^(\d{1,2}):(\d{2})\s*(a\.?\s*m\.?|p\.?\s*m\.?|am|pm)\s*$/i

export const TIME_INPUT_PLACEHOLDER = "ej. 10:00 p.m."

function parseApiTimeToDate(apiTime: string): Date | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(apiTime.trim())
  if (!match) {
    return null
  }
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) {
    return null
  }
  const date = new Date(TIME_REFERENCE_DATE)
  date.setHours(hours, minutes, 0, 0)
  return date
}

function parseSpanish12hInput(input: string): Date | null {
  const match = TIME_INPUT_12H_REGEX.exec(input.trim())
  if (!match) {
    return null
  }
  let hours = Number(match[1])
  const minutes = Number(match[2])
  const meridiem = match[3].toLowerCase().replace(/\s|\./g, "")
  const isPm = meridiem.startsWith("p")
  if (hours < 1 || hours > 12 || minutes > 59) {
    return null
  }
  if (hours === 12) {
    hours = isPm ? 12 : 0
  } else if (isPm) {
    hours += 12
  }
  const date = new Date(TIME_REFERENCE_DATE)
  date.setHours(hours, minutes, 0, 0)
  return date
}

/** Hora de un `Date` para UI, en el formato del locale. */
export function formatClockTimeFromDate(date: Date, locale: string): string {
  if (!isValid(date)) {
    return ""
  }
  return format(date, TIME_DISPLAY_FORMAT, { locale: dateLocale(locale) })
}

/**
 * Convierte `HH:mm` del backend a texto para UI (p. ej. `22:00` → `10:00 p.m.`).
 */
export function formatTimeForDisplay(apiTime: string, locale: string): string {
  const date = parseApiTimeToDate(apiTime)
  if (!date) {
    return apiTime
  }
  return formatClockTimeFromDate(date, locale)
}

/** `2:30 p.m.`: hora corta del reloj, sin cero a la izquierda. */
export function formatShortClockTime(apiTime: string, locale: string): string {
  const date = parseApiTimeToDate(apiTime)
  if (!date) {
    return apiTime
  }
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date)
}

/** Rango horario para listas y ajustes. */
export function formatTimeRange({
  start,
  end,
  locale,
}: {
  start: string
  end: string
  locale: string
}): string {
  return `${formatTimeForDisplay(start, locale)} – ${formatTimeForDisplay(end, locale)}`
}

/**
 * Normaliza entrada del usuario (12 h o 24 h) a `HH:mm` para guardar en API.
 */
export function normalizeTimeToApi(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) {
    return null
  }

  const fromApi = parseApiTimeToDate(trimmed)
  if (fromApi) {
    return format(fromApi, TIME_API_FORMAT)
  }

  const fromSpanish = parseSpanish12hInput(trimmed)
  if (fromSpanish) {
    return format(fromSpanish, TIME_API_FORMAT)
  }

  for (const pattern of TIME_PARSE_PATTERNS_12H) {
    const parsed = parse(trimmed, pattern, TIME_REFERENCE_DATE, { locale: es })
    if (isValid(parsed)) {
      return format(parsed, TIME_API_FORMAT)
    }
  }

  return null
}

/**
 * Fecha y hora completas (sesiones, historial). Las pantallas pasan el locale
 * del perfil; el valor por defecto queda para llamadas internas y pruebas.
 */
export function formatDateTime(
  iso: string,
  locale: string = DEFAULT_LOCALE
): string {
  const date = parseISO(iso)
  if (!isValid(date)) {
    return ""
  }
  return `${formatDate(iso, locale)}, ${formatClockTimeFromDate(date, locale)}`
}

/**
 * Solo fecha corta: `4 oct 2026`. Las pantallas pasan el locale del perfil; el
 * valor por defecto queda para llamadas internas y pruebas.
 */
export function formatDate(
  iso: string,
  locale: string = DEFAULT_LOCALE
): string {
  const date = parseISO(iso)
  if (!isValid(date)) {
    return ""
  }
  return formatDayMonthYear(date, locale)
}

/** Hora en listas de notificaciones. */
export function formatNotificationListTime(
  iso: string,
  locale: string
): string {
  const date = parseISO(iso)
  if (!isValid(date)) {
    return ""
  }
  return formatClockTimeFromDate(date, locale)
}

export type NotificationDateSectionKey = "today" | "yesterday" | string

export function getNotificationDateSectionKey(
  iso: string
): NotificationDateSectionKey {
  const date = parseISO(iso)
  if (!isValid(date)) {
    return "unknown"
  }
  if (isToday(date)) {
    return "today"
  }
  if (isYesterday(date)) {
    return "yesterday"
  }
  return format(date, "yyyy-MM-dd")
}

export function formatNotificationDateSectionLabel({
  sectionKey,
  locale,
  referenceIso,
}: {
  sectionKey: NotificationDateSectionKey
  locale: string
  referenceIso?: string
}): string {
  if (sectionKey === "today") {
    return "Hoy"
  }
  if (sectionKey === "yesterday") {
    return "Ayer"
  }
  const date = referenceIso
    ? parseISO(referenceIso)
    : parseISO(`${sectionKey}T12:00:00`)
  if (!isValid(date)) {
    return sectionKey
  }
  return format(date, "PPP", { locale: dateLocale(locale) })
}
