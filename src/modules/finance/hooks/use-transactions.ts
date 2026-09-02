"use client"

import { apiGet } from "@/src/config/api-client"
import {
  buildTransactionsSearchParams,
  type FinanceTransactionsQuery,
} from "@/src/modules/finance/lib/transactions-query"
import {
  FINANCE_TRANSACTIONS_QUERY_KEY,
  type FinancePaginated,
} from "@/src/modules/finance/types/api"
import type { FinanceTransaction } from "@/src/modules/finance/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useQuery } from "@tanstack/react-query"

export function useTransactions(
  enabled: boolean,
  query: FinanceTransactionsQuery,
) {
  const search = buildTransactionsSearchParams(query)
  return useQuery({
    queryKey: [...FINANCE_TRANSACTIONS_QUERY_KEY, "list", query],
    queryFn: () =>
      apiGet<FinancePaginated<FinanceTransaction>>(
        `${API_ENDPOINTS.FINANCE.TRANSACTIONS}?${search}`,
      ),
    enabled,
  })
}

export function useTransaction(enabled: boolean, id: string | null) {
  return useQuery({
    queryKey: [...FINANCE_TRANSACTIONS_QUERY_KEY, "detail", id],
    queryFn: () =>
      apiGet<FinanceTransaction>(API_ENDPOINTS.FINANCE.TRANSACTION(id!)),
    enabled: enabled && Boolean(id),
  })
}
