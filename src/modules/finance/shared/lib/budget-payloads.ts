import { parseFinanceMoney } from "./money.ts"

const PERIODS = ["MONTHLY", "BIWEEKLY", "CUSTOM"] as const
export type CreateBudgetPeriod = (typeof PERIODS)[number]

export type CreateBudgetBody = {
  categoryId: string
  periodType: CreateBudgetPeriod
  periodStart: string
  periodEnd: string
  amountLimit: number
  alertThresholdPct?: number
}

export type PayloadResult<T> =
  { ok: true; body: T } | { ok: false; error: string }

function pad(value: number): string {
  return String(value).padStart(2, "0")
}

export function dateInputValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function monthPeriodBounds(now = new Date()): {
  periodStart: string
  periodEnd: string
} {
  return {
    periodStart: dateInputValue(new Date(now.getFullYear(), now.getMonth(), 1)),
    periodEnd: dateInputValue(
      new Date(now.getFullYear(), now.getMonth() + 1, 0)
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
  now = new Date()
): { periodStart: string; periodEnd: string } {
  if (periodType === "BIWEEKLY") {
    return biweeklyPeriodBounds(now)
  }
  return monthPeriodBounds(now)
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

export function buildCreateBudgetBody(input: {
  categoryId?: string
  periodType: string
  periodStart: string
  periodEnd: string
  amountLimit: string
  alertThresholdPct?: string
}): PayloadResult<CreateBudgetBody> {
  if (!PERIODS.includes(input.periodType as CreateBudgetPeriod)) {
    return { ok: false, error: "Periodo inválido" }
  }
  const categoryId = input.categoryId?.trim()
  if (!categoryId) {
    return { ok: false, error: "Elige una categoría" }
  }
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
  const amountLimit = parseFinanceMoney(input.amountLimit)
  if (amountLimit === null) {
    return { ok: false, error: "Tope inválido" }
  }
  const body: CreateBudgetBody = {
    categoryId,
    periodType: input.periodType as CreateBudgetPeriod,
    periodStart,
    periodEnd,
    amountLimit,
  }
  const thresholdRaw = input.alertThresholdPct?.trim()
  if (thresholdRaw) {
    const alertThresholdPct = Number(thresholdRaw)
    if (!Number.isFinite(alertThresholdPct)) {
      return { ok: false, error: "Umbral inválido" }
    }
    if (alertThresholdPct < 0 || alertThresholdPct > 100) {
      return { ok: false, error: "El umbral debe estar entre 0 y 100" }
    }
    body.alertThresholdPct = alertThresholdPct
  }
  return { ok: true, body }
}
