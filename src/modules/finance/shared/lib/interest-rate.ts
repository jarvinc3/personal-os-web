/**
 * Loan `interestRate` is a fraction 0–1 on the API (`0.12` = 12%).
 * UI fields are annual percent (`12`). Never send or display the fraction as a
 * percent integer.
 */

function round4(value: number): number {
  return Math.round(value * 10000) / 10000
}

function trimDecimal(value: number): string {
  if (Number.isInteger(value)) {
    return String(value)
  }
  return String(round4(value)).replace(/(\.\d*?[1-9])0+$/, "$1")
}

export type RateParseResult =
  { ok: true; interestRate?: number } | { ok: false; error: string }

/**
 * Converts a UI percent string (`"12"`) to an API fraction (`0.12`).
 * Empty input omits the field (null ≠ 0). `"0"` sends `0`.
 */
export function percentToRateFraction(input: string): RateParseResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return { ok: true }
  }
  const percent = Number(trimmed)
  if (!Number.isFinite(percent)) {
    return { ok: false, error: "Tasa inválida" }
  }
  if (percent < 0 || percent > 100) {
    return { ok: false, error: "La tasa anual va de 0 a 100%" }
  }
  return { ok: true, interestRate: round4(percent / 100) }
}

/**
 * Converts an API fraction (`"0.12"`) to a UI percent string (`"12"`).
 * `null` / empty means not provided — distinct from `"0"` (0%).
 */
export function rateFractionToPercent(
  rate: string | number | null | undefined
): string | null {
  if (rate === null || rate === undefined) {
    return null
  }
  if (typeof rate === "string" && !rate.trim()) {
    return null
  }
  const fraction = typeof rate === "number" ? rate : Number(rate)
  if (!Number.isFinite(fraction)) {
    return null
  }
  return trimDecimal(round4(fraction * 100))
}

/** Display label: `"0.12"` → `"12%"`. Null → `"Sin tasa"`. Never `"0.12%"`. */
export function formatRatePercentLabel(
  rate: string | number | null | undefined
): string {
  const percent = rateFractionToPercent(rate)
  if (percent === null) {
    return "Sin tasa"
  }
  return `${percent}%`
}
