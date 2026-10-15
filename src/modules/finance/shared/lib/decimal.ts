import Decimal from "decimal.js-light"

export type FinanceDecimalInput = Decimal | string | number | null | undefined

/** Money keeps two decimals; the API sends amounts as strings (ADR-002). */
export const FINANCE_MONEY_DECIMALS = 2

export function toDecimal(value: FinanceDecimalInput): Decimal {
  if (value === null || value === undefined) {
    return new Decimal(0)
  }
  return new Decimal(value)
}

/**
 * Rounding for money is bankers' rounding (ROUND_HALF_EVEN), the same policy
 * the back uses: a half cent lands on the even cent.
 */
export function roundDecimal(value: FinanceDecimalInput): Decimal {
  return toDecimal(value).toDecimalPlaces(
    FINANCE_MONEY_DECIMALS,
    Decimal.ROUND_HALF_EVEN
  )
}

/** Exact sum of money values, never through JavaScript number arithmetic. */
export function sumDecimals(values: readonly FinanceDecimalInput[]): Decimal {
  let total = new Decimal(0)
  for (const value of values) {
    total = total.plus(toDecimal(value))
  }
  return total
}

/** `part` as a percentage of `whole`, as a number for charts and labels. */
export function decimalPercent(
  part: FinanceDecimalInput,
  whole: FinanceDecimalInput
): number {
  const total = toDecimal(whole)
  if (total.isZero()) {
    return 0
  }
  return toDecimal(part).div(total).times(100).toNumber()
}

/** A decimal as a money number, only where a chart needs a number. */
export function decimalAmount(value: FinanceDecimalInput): number {
  return toDecimal(value).toNumber()
}
