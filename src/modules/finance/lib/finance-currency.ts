import { narrowCurrencySymbol } from "./money.ts"

export const FINANCE_QUICK_CURRENCIES = ["USD", "EUR"] as const

/** ISO codes whose flag is not the first two letters (euro area, etc.). */
const CURRENCY_FLAG_REGION: Record<string, string> = {
  EUR: "EU",
}

/** ISO 3166 region used for the flag. Euro maps to EU. */
export function currencyFlagRegion(code: string): string | null {
  const normalized = code.trim().toUpperCase()
  if (!/^[A-Z]{3}$/.test(normalized)) return null
  const region = CURRENCY_FLAG_REGION[normalized] ?? normalized.slice(0, 2)
  return /^[A-Z]{2}$/.test(region) ? region : null
}

function regionalIndicator(region: string): string | null {
  if (!/^[A-Z]{2}$/.test(region)) return null
  const points = [...region].map(
    (char) => 0x1f1e6 + char.charCodeAt(0) - 65,
  )
  return String.fromCodePoint(...points)
}

export function currencyFlagEmoji(code: string): string {
  const region = currencyFlagRegion(code)
  if (!region) return "🏳️"
  return regionalIndicator(region) ?? "🏳️"
}

/** Trigger copy: flag, ISO code, and narrow symbol. Example: `🇩🇴 DOP $`. */
export function formatCurrencyTrigger(code: string): string {
  const normalized = code.trim().toUpperCase()
  const flag = currencyFlagEmoji(normalized)
  const symbol = narrowCurrencySymbol(normalized)
  if (!normalized) return flag
  return symbol ? `${flag} ${normalized} ${symbol}` : `${flag} ${normalized}`
}

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
