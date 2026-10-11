"use client"

import { useFinanceEnabled } from "./use-finance-enabled"
import { useExchangeRates } from "./use-exchange-rates"
import { buildFinanceCurrencyOptions } from "@/src/modules/finance/shared/lib/finance-currency"
import { useMemo } from "react"

/** Principal currency plus the ones added in Settings → Currencies, with each rate in the principal. */
export function useFinanceCurrencyChoices(currentCode = "") {
  const { config } = useFinanceEnabled()
  const baseCurrency = config.baseCurrency
  const base = baseCurrency.trim().toUpperCase()
  const codes = useMemo(
    () =>
      buildFinanceCurrencyOptions(
        baseCurrency,
        config.trackedCurrencies,
        currentCode ? [currentCode] : []
      ),
    [baseCurrency, config.trackedCurrencies, currentCode]
  )
  const quoteCodes = useMemo(
    () => codes.filter((code) => code !== base),
    [codes, base]
  )
  const ratesQuery = useExchangeRates(baseCurrency, quoteCodes)
  const quotes = useMemo(() => {
    const map = new Map<string, string | null>()
    if (base) {
      map.set(base, "1")
    }
    for (const quote of ratesQuery.data?.rates ?? []) {
      const code = quote.currency.trim().toUpperCase()
      if (code) {
        map.set(code, quote.rate)
      }
    }
    return map
  }, [base, ratesQuery.data])

  return { baseCurrency, codes, quotes }
}
