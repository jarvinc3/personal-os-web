import { parseFinanceMoney } from "./money.ts"

const PERIODS = ["MONTHLY", "BIWEEKLY", "CUSTOM"] as const
export type CreateBudgetPeriod = (typeof PERIODS)[number]

export type CreateBudgetBody = {
  categoryIds: string[]
  categoryId?: string
  periodType: CreateBudgetPeriod
  periodStart: string
  periodEnd: string
  amountLimit: number
  alertThresholdPct?: number
  includeChildren?: boolean
  rollover?: "NONE" | "SURPLUS" | "SURPLUS_AND_DEFICIT"
  recurring?: boolean
}

export type PayloadResult<T> =
  { ok: true; body: T } | { ok: false; error: string }

function pad(value: number): string {
  return String(value).padStart(2, "0")
}

export function dateInputValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function monthPeriodBounds(
  now = new Date(),
  monthStartDay = 1
): {
  periodStart: string
  periodEnd: string
} {
  const day = Math.min(Math.max(Math.trunc(monthStartDay), 1), 28)
  const start =
    now.getDate() >= day
      ? new Date(now.getFullYear(), now.getMonth(), day)
      : new Date(now.getFullYear(), now.getMonth() - 1, day)
  return {
    periodStart: dateInputValue(start),
    periodEnd: dateInputValue(
      new Date(start.getFullYear(), start.getMonth() + 1, day - 1)
    ),
  }
}

export function biweeklyPeriodBounds(now = new Date()): {
  periodStart: string
  periodEnd: string
} {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 13)
  return {
    periodStart: dateInputValue(now),
    periodEnd: dateInputValue(end),
  }
}

export function boundsForPeriod(
  periodType: string,
  options: { now?: Date; monthStartDay?: number } = {}
): { periodStart: string; periodEnd: string } {
  const now = options.now ?? new Date()
  if (periodType === "BIWEEKLY") {
    return biweeklyPeriodBounds(now)
  }
  return monthPeriodBounds(now, options.monthStartDay ?? 1)
}

export function budgetPctUsed(
  spent: string | number | null | undefined,
  limit: string | number | null | undefined
): number | null {
  const amountSpent = parseFinanceMoney(spent)
  const amountLimit = parseFinanceMoney(limit)
  if (amountSpent === null || amountLimit === null || amountLimit === 0) {
    return null
  }
  return (amountSpent / amountLimit) * 100
}

type BudgetCategoryIdsInput = {
  categoryId?: string
  categoryIds?: string[]
}

/** Ids de categoría que viajan en el body: el arreglo manda sobre la categoría suelta. */
function budgetCategoryIds(input: BudgetCategoryIdsInput): string[] {
  if (input.categoryIds && input.categoryIds.length > 0) {
    return input.categoryIds
  }
  const singleCategoryId = input.categoryId?.trim()
  if (singleCategoryId) {
    return [singleCategoryId]
  }
  return []
}

function budgetPeriodError(periodType: string): string | null {
  return PERIODS.includes(periodType as CreateBudgetPeriod)
    ? null
    : "Periodo inválido"
}

function budgetDates(input: {
  periodStart: string
  periodEnd: string
}): PayloadResult<{ periodStart: string; periodEnd: string }> {
  const periodStart = input.periodStart.trim()
  const periodEnd = input.periodEnd.trim()
  if (!periodStart || !periodEnd) {
    return { ok: false, error: "Fechas obligatorias" }
  }
  if (periodStart > periodEnd) {
    return {
      ok: false,
      error: "El fin del periodo no puede ser anterior al inicio",
    }
  }
  return { ok: true, body: { periodStart, periodEnd } }
}

function budgetThreshold(
  raw: string | undefined
): PayloadResult<number | undefined> {
  const thresholdRaw = raw?.trim()
  if (!thresholdRaw) {
    return { ok: true, body: undefined }
  }
  const alertThresholdPct = Number(thresholdRaw)
  if (!Number.isFinite(alertThresholdPct)) {
    return { ok: false, error: "Umbral inválido" }
  }
  if (alertThresholdPct < 0 || alertThresholdPct > 100) {
    return { ok: false, error: "El umbral debe estar entre 0 y 100" }
  }
  return { ok: true, body: alertThresholdPct }
}

function applyBudgetOptionals(
  body: CreateBudgetBody,
  input: {
    includeChildren?: boolean
    rollover?: "NONE" | "SURPLUS" | "SURPLUS_AND_DEFICIT"
    recurring?: boolean
  }
): void {
  if (input.includeChildren !== undefined) {
    body.includeChildren = input.includeChildren
  }
  if (input.rollover) {
    body.rollover = input.rollover
  }
  if (input.recurring !== undefined) {
    body.recurring = input.recurring
  }
}

export function buildCreateBudgetBody(input: {
  categoryId?: string
  categoryIds?: string[]
  periodType: string
  periodStart: string
  periodEnd: string
  amountLimit: string
  alertThresholdPct?: string
  includeChildren?: boolean
  rollover?: "NONE" | "SURPLUS" | "SURPLUS_AND_DEFICIT"
  recurring?: boolean
}): PayloadResult<CreateBudgetBody> {
  const periodError = budgetPeriodError(input.periodType)
  if (periodError) {
    return { ok: false, error: periodError }
  }
  const categoryIds = budgetCategoryIds(input)
  if (categoryIds.length === 0) {
    return { ok: false, error: "Elige una categoría" }
  }
  const dates = budgetDates(input)
  if (!dates.ok) {
    return dates
  }
  const amountLimit = parseFinanceMoney(input.amountLimit)
  if (amountLimit === null) {
    return { ok: false, error: "Tope inválido" }
  }
  const threshold = budgetThreshold(input.alertThresholdPct)
  if (!threshold.ok) {
    return threshold
  }
  const body: CreateBudgetBody = {
    categoryIds,
    categoryId: categoryIds[0],
    periodType: input.periodType as CreateBudgetPeriod,
    periodStart: dates.body.periodStart,
    periodEnd: dates.body.periodEnd,
    amountLimit,
  }
  applyBudgetOptionals(body, input)
  if (threshold.body !== undefined) {
    body.alertThresholdPct = threshold.body
  }
  return { ok: true, body }
}
