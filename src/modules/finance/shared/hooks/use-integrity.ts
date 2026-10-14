"use client"

import { apiGet, apiPost } from "@/src/config/api-client"
import { invalidateFinancePositions } from "@/src/modules/finance/shared/hooks/use-balance-sheet"
import { FINANCE_INTEGRITY_QUERY_KEY } from "@/src/modules/finance/shared/types/api"
import type {
  FinanceBalanceRecalculation,
  FinanceIntegrityCheck,
} from "@/src/modules/finance/shared/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export type IntegrityTarget =
  { accountId: string; cardId?: never } | { accountId?: never; cardId: string }

function targetQuery(target?: IntegrityTarget): string {
  if (!target) {
    return ""
  }
  const params = new URLSearchParams()
  if ("accountId" in target && target.accountId) {
    params.set("accountId", target.accountId)
  } else if ("cardId" in target && target.cardId) {
    params.set("cardId", target.cardId)
  }
  const query = params.toString()
  return query ? `?${query}` : ""
}

export function useFinanceIntegrity(
  enabled: boolean,
  target?: IntegrityTarget
) {
  return useQuery({
    queryKey: [...FINANCE_INTEGRITY_QUERY_KEY, target ?? "all"],
    queryFn: () =>
      apiGet<FinanceIntegrityCheck>(
        `${API_ENDPOINTS.FINANCE.INTEGRITY_CHECK}${targetQuery(target)}`
      ),
    enabled,
  })
}

export function useRecalculateBalance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Record<string, string>) =>
      apiPost<FinanceBalanceRecalculation>(
        API_ENDPOINTS.FINANCE.INTEGRITY_RECALCULATE,
        body
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: FINANCE_INTEGRITY_QUERY_KEY,
      })
      invalidateFinancePositions(queryClient)
    },
  })
}
