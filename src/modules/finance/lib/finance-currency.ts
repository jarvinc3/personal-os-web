export const FINANCE_QUICK_CURRENCIES = ["USD", "EUR"] as const

function normalizeCurrencyCode(value: string): string {
  return value.trim().toUpperCase()
}

export function buildFinanceCurrencyOptions(
  baseCurrency: string,
  extraCodes: string[] = [],
): string[] {
  const codes: string[] = []
  const seen = new Set<string>()
  const add = (raw: string) => {
    const code = normalizeCurrencyCode(raw)
    if (!code || seen.has(code)) return
    seen.add(code)
    codes.push(code)
  }
  add(baseCurrency)
  for (const code of FINANCE_QUICK_CURRENCIES) add(code)
  for (const extra of extraCodes) add(extra)
  return codes
}
