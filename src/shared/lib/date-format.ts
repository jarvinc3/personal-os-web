import {
  format,
  formatDistanceToNow,
  isToday,
  isValid,
  isYesterday,
  parse,
  parseISO,
} from "date-fns"
import { es } from "date-fns/locale/es"

/** Formato canónico para API y preferencias (quiet hours, etc.). */
export const TIME_API_FORMAT = "HH:mm"

/** Formato legible en español: 12 h con a.m. / p.m. (ej. `10:00 p.m.`). */
export const TIME_DISPLAY_FORMAT = "hh:mm aaaa"

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

/**
 * Convierte `HH:mm` del backend a texto para UI (p. ej. `22:00` → `10:00 p.m.`).
 */
export function formatTimeForDisplay(apiTime: string): string {
  const date = parseApiTimeToDate(apiTime)
  if (!date) {
    return apiTime
  }
  return format(date, TIME_DISPLAY_FORMAT, { locale: es })
}

/**
 * Hora de un `Date` para UI (12 h, español).
 */
export function formatClockTimeFromDate(date: Date): string {
  if (!isValid(date)) {
    return ""
  }
  return format(date, TIME_DISPLAY_FORMAT, { locale: es })
}

/**
 * Rango horario en español para listas y ajustes.
 */
export function formatTimeRange(start: string, end: string): string {
  return `${formatTimeForDisplay(start)} – ${formatTimeForDisplay(end)}`
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
 * Tiempo relativo en español (notificaciones, actividad reciente).
 */
export function formatRelativeTimeFromIso(iso: string): string {
  const date = parseISO(iso)
  if (!isValid(date)) {
    return ""
  }
  if (Date.now() - date.getTime() < 45_000) {
    return "Ahora"
  }
  return formatDistanceToNow(date, { addSuffix: true, locale: es })
}

/**
 * Fecha y hora completas (sesiones, historial).
 */
export function formatDateTime(iso: string): string {
  const date = parseISO(iso)
  if (!isValid(date)) {
    return ""
  }
  return format(date, "d 'de' MMMM yyyy, hh:mm aaaa", { locale: es })
}

/**
 * Solo fecha corta.
 */
export function formatDate(iso: string): string {
  const date = parseISO(iso)
  if (!isValid(date)) {
    return ""
  }
  return format(date, "d MMM yyyy", { locale: es })
}

/**
 * Hora en listas de notificaciones (12 h, español).
 */
export function formatNotificationListTime(iso: string): string {
  const date = parseISO(iso)
  if (!isValid(date)) {
    return ""
  }
  return format(date, TIME_DISPLAY_FORMAT, { locale: es })
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

function formatTimelineDay(date: Date): string {
  return String(date.getDate()).padStart(2, "0")
}

/**
 * Rango semanal para timeline de finanzas: `jun 01 - 07`.
 */
export function formatWeekRangeLabel(start: Date, end: Date): string {
  const startMonth = format(start, "MMM", { locale: es }).toLowerCase()
  const endMonth = format(end, "MMM", { locale: es }).toLowerCase()
  const startDay = formatTimelineDay(start)
  const endDay = formatTimelineDay(end)

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}`
  }

  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`
}

/**
 * Etiqueta de mes para banners: `Junio 2026`.
 */
export function formatMonthYearLabel(date: Date): string {
  const label = format(date, "MMMM yyyy", { locale: es })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/** Encabezado de día en timeline: `Miércoles 14 Oct.`. */
export function formatDayHeaderLabel(date: Date): string {
  const weekday = format(date, "EEEE", { locale: es })
  const weekdayLabel = weekday.charAt(0).toUpperCase() + weekday.slice(1)
  const day = format(date, "d")
  const month = format(date, "MMM", { locale: es }).replace(".", "")
  const monthLabel =
    month.charAt(0).toUpperCase() + month.slice(1).toLowerCase()
  return `${weekdayLabel} ${day} ${monthLabel}.`
}

export function formatNotificationDateSectionLabel(
  sectionKey: NotificationDateSectionKey,
  referenceIso?: string
): string {
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
  return format(date, "d 'de' MMMM yyyy", { locale: es })
}
