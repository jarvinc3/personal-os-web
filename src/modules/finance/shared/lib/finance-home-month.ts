import { decimalPercent, toDecimal } from "./decimal.ts"
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

const EXPENSE_TREND_PERCENT_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
})

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
    Math.round(
      decimalPercent(
        toDecimal(currentExpenses).minus(toDecimal(previousExpenses)),
        previousExpenses
      ) * 10
    ) / 10
  if (changePercent === 0) {
    return { label: "0%", direction: "flat", tone: "neutral" }
  }
  const label = EXPENSE_TREND_PERCENT_FORMATTER.format(changePercent / 100)
  if (changePercent > 0) {
    return {
      label,
      direction: "up",
      tone: "warning",
    }
  }
  return {
    label,
    direction: "down",
    tone: changePercent <= CONSIDERABLE_DROP_PERCENT ? "danger" : "success",
  }
}
