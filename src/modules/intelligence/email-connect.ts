import { z } from "zod"

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
  choice: EmailImportPeriodChoice
  senderFilter: string
}): EmailConnectBody {
  const body: EmailConnectBody = {
    senderFilter: normalizeSenderFilter(senderFilter),
  }
  if (choice !== KEEP_EMAIL_IMPORT_PERIOD) {
    body.period = choice
  }
  return body
}

const EMAIL_IMPORT_PERIOD_CHOICES = [
  KEEP_EMAIL_IMPORT_PERIOD,
  ...EMAIL_IMPORT_PERIODS,
] as const

/** Largo máximo que acepta `ConnectGmailDto.senderFilter` en el back. */
export const SENDER_FILTER_MAX_LENGTH = 120

/** Dominio sin `@` ni espacios, con al menos un punto: el patrón del back. */
const SENDER_FILTER_PATTERN =
  /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i

/** Un filtro vacío significa «todos los remitentes» y es válido. */
function isSenderFilterDomain(value: string): boolean {
  return value.length === 0 || SENDER_FILTER_PATTERN.test(value)
}

/**
 * Una sola validación para habilitar el botón y para el envío: una conexión
 * nueva exige un período y la reconexión admite mantener el guardado.
 */
export function emailConnectSchema({ reconnect }: { reconnect: boolean }) {
  return z.object({
    choice: reconnect
      ? z.enum(EMAIL_IMPORT_PERIOD_CHOICES)
      : z.enum(EMAIL_IMPORT_PERIODS),
    senderFilter: z
      .string()
      .trim()
      .max(SENDER_FILTER_MAX_LENGTH, "El filtro es demasiado largo")
      .refine(isSenderFilterDomain, {
        message: "Escribe un dominio válido, por ejemplo bhd.com.do",
      }),
  })
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
