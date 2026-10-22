import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"

export function withCurrency(
  display: FinanceMoneyDisplay,
  currency: string
): FinanceMoneyDisplay {
  return { ...display, currency }
}

type RemainingCaptionInput = {
  current: number | null
  target: number | null
  display: FinanceMoneyDisplay
  reached: string
  prefix: string
}

/** Money still missing to reach the target, or the reached message. */
export function remainingCaption({
  current,
  target,
  display,
  reached,
  prefix,
}: RemainingCaptionInput): string | undefined {
  if (current === null || target === null) {
    return undefined
  }
  const left = target - current
  if (left <= 0) {
    return reached
  }
  return `${prefix} ${formatFinanceMoney(left, display)}`
}
