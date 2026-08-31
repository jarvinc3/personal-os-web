export type FinanceMoneyDisplay = {
  currency: string
  showCents: boolean
  compactNumbers: boolean
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
  if (amount === null) {
    return "—"
  }
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: display.currency,
      minimumFractionDigits: display.showCents ? 2 : 0,
      maximumFractionDigits: display.showCents ? 2 : 0,
      notation: display.compactNumbers ? "compact" : "standard",
    }).format(amount)
  } catch {
    return "—"
  }
}
