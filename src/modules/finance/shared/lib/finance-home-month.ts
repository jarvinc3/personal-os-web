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

function expenseTrendPercentFormatter(locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: "exceptZero",
  })
}

export function expenseTrend(input: {
  currentExpenses: string
  previousExpenses: string
  locale: string
}): FinanceExpenseTrend | null {
  const { currentExpenses, previousExpenses, locale } = input
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
  const label = expenseTrendPercentFormatter(locale).format(changePercent / 100)
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
