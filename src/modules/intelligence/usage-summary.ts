import { SEMANTIC_TYPE_LABELS } from "@/src/modules/intelligence/review-labels"
import type {
  EmailUsageBucket,
  EmailUsageCostStatus,
  EmailUsageDay,
  EmailUsageHour,
} from "@/src/modules/intelligence/types/intelligence.types"
import { formatDayMonthYear } from "@/src/shared/lib/date-format"

const MS_PER_DAY = 86_400_000
const HOURS_PER_DAY = 24
const SIN_CLASSIFICATION_LABEL = "Sin clasificación"

/** Rangos que ofrece el filtro; `days` es lo que entiende el back. */
export const USAGE_RANGES = [
  { days: 1, label: "Hoy", caption: "Hoy (UTC)" },
  { days: 7, label: "7 días", caption: "Últimos 7 días" },
  { days: 30, label: "30 días", caption: "Últimos 30 días" },
] as const

export type UsageDays = (typeof USAGE_RANGES)[number]["days"]
export const DEFAULT_USAGE_DAYS: UsageDays = 7

const USAGE_RANGE_BY_DAYS = Object.fromEntries(
  USAGE_RANGES.map((range) => [range.days, range])
) as Record<UsageDays, (typeof USAGE_RANGES)[number]>

const EMPTY_USAGE_BUCKET: EmailUsageBucket = {
  calls: 0,
  inputTokens: 0,
  outputTokens: 0,
  costUsd: 0,
}

const USAGE_TYPE_LABELS: Record<string, string> = {
  ...SEMANTIC_TYPE_LABELS,
  SIN_CLASIFICACION: SIN_CLASSIFICATION_LABEL,
}

export function isUsageDays(value: number): value is UsageDays {
  return value in USAGE_RANGE_BY_DAYS
}

export function usageRangeCaption(days: UsageDays): string {
  return USAGE_RANGE_BY_DAYS[days].caption
}

function utcDayStart(isoDate: string): Date {
  const day = new Date(`${isoDate.slice(0, 10)}T00:00:00.000Z`)

  if (Number.isNaN(day.getTime())) {
    throw new Error(`Fecha de rango inválida: ${isoDate}`)
  }

  return day
}

/** Completa con ceros los días del rango para que la gráfica no salte huecos. */
export function fillDailyUsage({
  byDay,
  from,
  to,
}: {
  byDay: readonly EmailUsageDay[]
  from: string
  to: string
}): EmailUsageDay[] {
  const buckets = new Map(byDay.map((bucket) => [bucket.day, bucket]))
  const start = utcDayStart(from).getTime()
  const end = utcDayStart(to).getTime()

  if (end < start) {
    throw new Error("El rango de uso termina antes de empezar.")
  }

  const filled: EmailUsageDay[] = []

  for (let time = start; time <= end; time += MS_PER_DAY) {
    const day = new Date(time).toISOString().slice(0, 10)
    filled.push(buckets.get(day) ?? { day, ...EMPTY_USAGE_BUCKET })
  }

  return filled
}

/** El back agrega la misma hora de todos los días; la vista pinta 0 a 23. */
export function fillHourlyUsage(
  byHour: readonly EmailUsageHour[]
): EmailUsageHour[] {
  const buckets = new Map(byHour.map((bucket) => [bucket.hour, bucket]))

  return Array.from(
    { length: HOURS_PER_DAY },
    (_, hour) => buckets.get(hour) ?? { hour, ...EMPTY_USAGE_BUCKET }
  )
}

export type UsageProgress = {
  percent: number
  used: number
  remaining: number
}

/** Avance de un tope; un límite inválido no inventa consumo. */
export function usageProgress({
  limit,
  used,
}: {
  limit: number
  used: number
}): UsageProgress {
  if (!Number.isFinite(limit) || limit <= 0) {
    return { percent: 0, used: 0, remaining: 0 }
  }

  const clampedUsed = Math.min(Math.max(used, 0), limit)

  return {
    percent: (clampedUsed / limit) * 100,
    used: clampedUsed,
    remaining: limit - clampedUsed,
  }
}

/** La carga inicial llega como límite y restante; el usado se deriva. */
export function initialBudgetProgress({
  limit,
  remaining,
}: {
  limit: number
  remaining: number
}): UsageProgress {
  return usageProgress({ limit, used: limit - remaining })
}

export const USAGE_RESET_MARGIN_MS = 60_000
export const USAGE_RESET_RETRY_MS = 60_000
export const USAGE_RESET_MAX_RETRIES = 5

/** Los topes diarios se reinician a medianoche UTC, como los cuenta el back. */
export function nextUtcDailyReset(now: Date): Date {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  )
}

/** Reinicio que sigue a una hora del servidor. */
export function nextUsageReset(serverNow: string): Date {
  const serverTime = Date.parse(serverNow)

  if (Number.isNaN(serverTime)) {
    throw new Error(`Hora del servidor inválida: ${serverNow}`)
  }

  return nextUtcDailyReset(new Date(serverTime))
}

/** Espera hasta el reinicio más el margen; el día nunca sale del reloj del cliente. */
export function usageRefreshDelay({
  serverNow,
  clientNow,
  marginMs = USAGE_RESET_MARGIN_MS,
}: {
  serverNow: string
  clientNow: number
  marginMs?: number
}): number {
  const resetAt = nextUsageReset(serverNow).getTime()

  return Math.max(1_000, resetAt - clientNow + marginMs)
}

/** Si una respuesta del servidor ya pasó el reinicio que esperaba el temporizador. */
export function usageResetReached({
  previousServerNow,
  serverNow,
}: {
  previousServerNow: string
  serverNow: string
}): boolean {
  const serverTime = Date.parse(serverNow)

  return (
    !Number.isNaN(serverTime) &&
    serverTime >= nextUsageReset(previousServerNow).getTime()
  )
}

export type UsageCostTone = "ok" | "warning" | "paused"

export function usageCostTone(status: EmailUsageCostStatus): UsageCostTone {
  if (status === "PAUSED") {
    return "paused"
  }
  if (status === "ALERT") {
    return "warning"
  }
  return "ok"
}

export function usageTypeLabel(type: string): string {
  return USAGE_TYPE_LABELS[type] ?? type
}

export function usageTotalTokens(bucket: EmailUsageBucket): number {
  return bucket.inputTokens + bucket.outputTokens
}

export function formatUsageCount(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(
    value
  )
}

export function formatUsagePercent(percent: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(percent / 100)
}

const USAGE_COST_CURRENCY = "USD"
const SMALL_COST_FRACTION_DIGITS = 4
const REGULAR_COST_FRACTION_DIGITS = 2
/** Costo más pequeño que la pantalla puede mostrar con cuatro decimales. */
const SMALLEST_VISIBLE_COST = 0.0001

function usageCostFractionDigits(value: number): number {
  return Math.abs(value) < 1
    ? SMALL_COST_FRACTION_DIGITS
    : REGULAR_COST_FRACTION_DIGITS
}

function usageCostFormatter(locale: string, fractionDigits: number) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: USAGE_COST_CURRENCY,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
}

/** Un costo mayor que cero que redondea a cero se lee como «< US$0.0001». */
export function formatUsageCost(value: number, locale: string): string {
  const fractionDigits = usageCostFractionDigits(value)
  const formatter = usageCostFormatter(locale, fractionDigits)
  const isBelowPrecision =
    value !== 0 && Math.abs(value) < 0.5 * 10 ** -fractionDigits

  if (isBelowPrecision) {
    return `< ${formatter.format(SMALLEST_VISIBLE_COST)}`
  }

  return formatter.format(value)
}

/** Sin símbolo para los ejes de las gráficas; el título dice que es USD. */
export function formatUsageCostAxis(value: number, locale: string): string {
  const fractionDigits = usageCostFractionDigits(value)

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

export function formatUsageReset(resetAt: Date, locale: string): string {
  // El reinicio se cuenta en UTC: la fecha se arma con esas partes para que el
  // formato de la app no la corra un día en un reloj detrás de UTC.
  const utcDay = new Date(
    resetAt.getUTCFullYear(),
    resetAt.getUTCMonth(),
    resetAt.getUTCDate()
  )
  const hours = String(resetAt.getUTCHours()).padStart(2, "0")
  const minutes = String(resetAt.getUTCMinutes()).padStart(2, "0")

  return `${formatDayMonthYear(utcDay, locale)}, ${hours}:${minutes} UTC`
}
