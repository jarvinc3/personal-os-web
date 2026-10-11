export type FinanceMoneyDisplay = {
  currency: string
  showCents: boolean
  compactNumbers: boolean
  /** When true, prefixes `+` / `-` before the currency code (e.g. `+DOP $10`). */
  leadingSign?: boolean
}

/** Digits and a single decimal point. Commas become dots. Letters are dropped. */
export function sanitizeAmountInput(value: string): string {
  let seenDot = false
  let next = ""
  for (const char of value.replace(/,/g, ".")) {
    if (char >= "0" && char <= "9") {
      next += char
      continue
    }
    if (char === "." && !seenDot) {
      seenDot = true
      next += "."
    }
  }
  return next
}

export function parseFinanceMoney(
  value: string | number | null | undefined
): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null
  }
  if (typeof value !== "string") {
    return null
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * Narrow currency glyph. English locale keeps `$` / `€` stable.
 * Some Spanish ICU data returns the ISO code again (`DOP` → `DOP`),
 * which would render as `DOP DOP 3,000`. That repeat becomes `$`.
 */
export function currencyGlyph(
  currency: string,
  narrowSymbol: string | undefined
): string | null {
  if (!narrowSymbol) {
    return null
  }
  if (narrowSymbol.trim().toUpperCase() === currency) {
    return "$"
  }
  return narrowSymbol
}

export function narrowCurrencySymbol(currency: string): string | null {
  const symbol = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  })
    .formatToParts(0)
    .find((part) => part.type === "currency")?.value
  return currencyGlyph(currency, symbol)
}

export function formatFinanceMoney(
  value: string | number | null | undefined,
  display: FinanceMoneyDisplay
): string {
  const amount = parseFinanceMoney(value)
  const currency = display.currency.trim().toUpperCase()
  if (amount === null || !currency) {
    return "—"
  }
  try {
    const symbol = narrowCurrencySymbol(currency)

    if (!symbol) {
      return "—"
    }

    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: display.showCents ? 2 : 0,
      maximumFractionDigits: display.showCents ? 2 : 0,
      notation: display.compactNumbers ? "compact" : "standard",
    }).format(Math.abs(amount))

    if (display.leadingSign) {
      const sign = amount < 0 ? "-" : "+"
      return `${sign}${currency} ${symbol}${formattedAmount}`
    }

    const sign = amount < 0 ? "-" : ""
    return `${currency} ${sign}${symbol}${formattedAmount}`
  } catch {
    return "—"
  }
}

export function formatCompactFinanceMoney(
  value: string | number | null | undefined,
  display: FinanceMoneyDisplay
): string {
  return formatFinanceMoney(value, { ...display, compactNumbers: true })
}

/**
 * Compact amount without the currency code, for the narrow centre of a chart
 * where the currency is already spelled out beside every row.
 */
export function formatCompactFinanceAmount(
  value: string | number | null | undefined
): string {
  const amount = parseFinanceMoney(value)
  if (amount === null) {
    return "—"
  }
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(amount)
}
