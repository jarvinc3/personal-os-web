const spanishCurrencyNames = new Intl.DisplayNames(["es"], {
  type: "currency",
})

/** e.g. USD -> "Dólar estadounidense". Falls back to the normalized code. */
export function currencyDisplayName(code: string): string {
  const normalized = code.trim().toUpperCase()
  if (!/^[A-Z]{3}$/.test(normalized)) {
    return normalized
  }
  const name = spanishCurrencyNames.of(normalized) ?? normalized
  return name.charAt(0).toUpperCase() + name.slice(1)
}
