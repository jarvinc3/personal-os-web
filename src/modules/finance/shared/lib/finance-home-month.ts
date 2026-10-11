import { parseFinanceMoney } from "./money.ts"

export type FinanceExpenseTrendDirection = "up" | "down" | "flat"

export type FinanceExpenseTrendTone =
  "success" | "warning" | "danger" | "neutral"

export type FinanceExpenseTrend = {
  label: string
  direction: FinanceExpenseTrendDirection
  tone: FinanceExpenseTrendTone
}

const CONSIDERABLE_DROP_PERCENT = -30

export function expenseTrend(
  currentExpenses: string,
  previousExpenses: string
): FinanceExpenseTrend | null {
  const current = parseFinanceMoney(currentExpenses)
  const previous = parseFinanceMoney(previousExpenses)
  if (current === null || previous === null || previous <= 0) {
    return null
  }

  const changePercent =
    Math.round(((current - previous) / previous) * 1000) / 10
  if (changePercent === 0) {
    return { label: "0%", direction: "flat", tone: "neutral" }
  }
  if (changePercent > 0) {
    return {
      label: `+${changePercent.toFixed(1)}%`,
      direction: "up",
      tone: "warning",
    }
  }
  return {
    label: `${changePercent.toFixed(1)}%`,
    direction: "down",
    tone: changePercent <= CONSIDERABLE_DROP_PERCENT ? "danger" : "success",
  }
}
