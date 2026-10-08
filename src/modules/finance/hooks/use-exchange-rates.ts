"use client"

import { apiGet } from "@/src/config/api-client"
import { FINANCE_EXCHANGE_RATES_QUERY_KEY } from "@/src/modules/finance/types/api"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useQuery } from "@tanstack/react-query"

export type ExchangeRateQuote = {
  currency: string
  rate: string | null
}

export type ExchangeRatesResponse = {
  baseCurrency: string
  date: string
  rates: ExchangeRateQuote[]
}

export function useExchangeRates(
  baseCurrency: string,
  quotes: readonly string[]
) {
  const sortedQuotes = quotes
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean)
    .sort()
  const quotesKey = sortedQuotes.join(",")

  return useQuery({
    queryKey: [...FINANCE_EXCHANGE_RATES_QUERY_KEY, baseCurrency, quotesKey],
    queryFn: () => {
      const params = new URLSearchParams({
        base: baseCurrency,
        quotes: quotesKey,
      })
      return apiGet<ExchangeRatesResponse>(
        `${API_ENDPOINTS.FINANCE.EXCHANGE_RATES}?${params.toString()}`
      )
    },
    enabled: sortedQuotes.length > 0,
  })
}
