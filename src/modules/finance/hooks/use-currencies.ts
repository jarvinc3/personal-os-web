"use client"

import { apiGet } from "@/src/config/api-client"
import { FINANCE_CURRENCIES_QUERY_KEY } from "@/src/modules/finance/types/api"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useQuery } from "@tanstack/react-query"

export function useCurrencies(enabled: boolean) {
  return useQuery({
    queryKey: FINANCE_CURRENCIES_QUERY_KEY,
    queryFn: () => apiGet<string[]>(API_ENDPOINTS.FINANCE.CURRENCIES),
    enabled,
    staleTime: 24 * 60 * 60 * 1000,
  })
}
