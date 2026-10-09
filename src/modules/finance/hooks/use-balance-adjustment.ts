"use client"

import { apiPost } from "@/src/config/api-client"
import { invalidateFinancePositions } from "@/src/modules/finance/hooks/use-balance-sheet"
import type { FinanceTransaction } from "@/src/modules/finance/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export type AdjustBalanceBody =
  | { accountId: string; balance: number }
  | { cardId: string; currency: string; balance: number }

type AdjustBalanceResult = {
  adjusted: boolean
  balance: number
  transaction: FinanceTransaction | null
}

export function useAdjustBalance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: AdjustBalanceBody) =>
      apiPost<AdjustBalanceResult>(API_ENDPOINTS.FINANCE.BALANCE_ADJUSTMENT, body),
    onSuccess: () => {
      invalidateFinancePositions(queryClient)
    },
  })
}
