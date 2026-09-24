export type FinanceMoneyDisplay = {
  currency: string
  showCents: boolean
  compactNumbers: boolean
  /** When true, prefixes `+` / `-` before the currency code (e.g. `+DOP $10`). */
  leadingSign?: boolean
}

export function parseFinanceMoney(value: string | number | null | undefined): number | null {
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

export function formatFinanceMoney(
  value: string | number | null | undefined,
  display: FinanceMoneyDisplay,
): string {
  const amount = parseFinanceMoney(value)
  const currency = display.currency.trim().toUpperCase()
  if (amount === null || !currency) {
    return "—"
  }
  try {
    const symbol = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    })
      .formatToParts(0)
      .find((part) => part.type === "currency")?.value

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
