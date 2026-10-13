"use client"

import { apiDelete, apiPost } from "@/src/config/api-client"
import { FINANCE_QUERY_KEY } from "@/src/modules/finance/shared/types/api"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export type LinkTransactionBody =
  | { kind: "LOAN_INSTALLMENT"; loanId: string; installmentId: string }
  | { kind: "RECEIVABLE_PAYMENT"; receivableId: string }
  | { kind: "SAVINGS_CONTRIBUTION"; goalId: string }

export function useLinkTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      transactionId,
      body,
    }: {
      transactionId: string
      body: LinkTransactionBody
    }) =>
      apiPost<unknown>(
        API_ENDPOINTS.FINANCE.TRANSACTION_LINK(transactionId),
        body
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FINANCE_QUERY_KEY })
    },
  })
}

export function useUnlinkTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (transactionId: string) =>
      apiDelete<unknown>(API_ENDPOINTS.FINANCE.TRANSACTION_LINK(transactionId)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FINANCE_QUERY_KEY })
    },
  })
}
