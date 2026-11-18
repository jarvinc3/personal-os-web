import { formatDayMonthYear } from "@/src/shared/lib/date-format"

/** Períodos que acepta `POST /intelligence/email/connect`. */
export const EMAIL_IMPORT_PERIODS = [
  "TODAY",
  "LAST_MONTH",
  "LAST_3_MONTHS",
] as const
export type EmailImportPeriod = (typeof EMAIL_IMPORT_PERIODS)[number]

/** Mantener el período guardado: no se envía `period` al reconectar. */
export const KEEP_EMAIL_IMPORT_PERIOD = "KEEP" as const
export type EmailImportPeriodChoice =
  EmailImportPeriod | typeof KEEP_EMAIL_IMPORT_PERIOD

export const EMAIL_IMPORT_PERIOD_LABELS: Record<EmailImportPeriod, string> = {
  TODAY: "Hoy",
  LAST_MONTH: "Último mes",
  LAST_3_MONTHS: "Últimos 3 meses",
}

export type EmailConnectBody = {
  period?: EmailImportPeriod
  senderFilter: string | null
}

export function normalizeSenderFilter(value: string): string | null {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

/**
 * El cuerpo del connect: `KEEP` omite el período para conservar el guardado, y
 * un filtro vacío viaja como `null` para borrarlo.
 */
export function emailConnectBody({
  choice,
  senderFilter,
}: {
  choice: EmailImportPeriodChoice | null
  senderFilter: string
}): EmailConnectBody {
  const body: EmailConnectBody = {
    senderFilter: normalizeSenderFilter(senderFilter),
  }
  if (choice !== null && choice !== KEEP_EMAIL_IMPORT_PERIOD) {
    body.period = choice
  }
  return body
}

/** Una conexión nueva exige período; una reconexión puede mantener el guardado. */
export function canConnectGmail({
  reconnect,
  choice,
}: {
  reconnect: boolean
  choice: EmailImportPeriodChoice | null
}): boolean {
  if (reconnect) {
    return true
  }
  return choice !== null && choice !== KEEP_EMAIL_IMPORT_PERIOD
}

/** La fecha guardada es un corte UTC: se pinta por su día, sin mover la zona. */
export function emailImportStartLabel(
  importStartAt: string | null | undefined,
  locale: string
): string | null {
  if (!importStartAt) {
    return null
  }
  const slice = importStartAt.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(slice)) {
    return null
  }
  const [year, month, day] = slice.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return formatDayMonthYear(date, locale)
}

/** «desde el 5 nov 2026 · bhd.com.do», o null sin fecha ni filtro. */
export function emailImportScopeLabel(
  {
    importStartAt,
    senderFilter,
  }: {
    importStartAt?: string | null
    senderFilter?: string | null
  },
  locale: string
): string | null {
  const start = emailImportStartLabel(importStartAt, locale)
  const filter = normalizeSenderFilter(senderFilter ?? "")
  const parts: string[] = []
  if (start) {
    parts.push(`desde el ${start}`)
  }
  if (filter) {
    parts.push(filter)
  }
  return parts.length > 0 ? parts.join(" · ") : null
}

/** ¿El borrador difiere de lo que ya tenía la conexión? */
export function emailConnectHasChanges(
  current: { choice: string; senderFilter: string },
  initial: { choice: string; senderFilter: string }
): boolean {
  return (
    current.choice !== initial.choice ||
    current.senderFilter !== initial.senderFilter
  )
}
