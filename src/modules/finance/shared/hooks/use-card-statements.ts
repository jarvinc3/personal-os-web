"use client"

import { apiGet, apiPatch } from "@/src/config/api-client"
import { useInfiniteFinanceList } from "@/src/modules/finance/shared/hooks/use-infinite-finance-list"
import { FINANCE_LIST_PAGE_SIZE } from "@/src/modules/finance/shared/lib/finance-query-options"
import {
  FINANCE_CARD_STATEMENTS_QUERY_KEY,
  type FinancePaginated,
} from "@/src/modules/finance/shared/types/api"
import type {
  FinanceCardStatement,
  FinanceCardStatementDetail,
} from "@/src/modules/finance/shared/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export type UpdateCardStatementBody = {
  minimumPayment?: number
  closingBalance?: number
  dueDate?: string
}

export function useCardStatements(enabled: boolean, cardId: string | null) {
  return useInfiniteFinanceList<FinancePaginated<FinanceCardStatement>>({
    queryKey: [...FINANCE_CARD_STATEMENTS_QUERY_KEY, cardId ?? ""],
    endpoint: API_ENDPOINTS.FINANCE.CARD_STATEMENTS(cardId ?? ""),
    params: { limit: FINANCE_LIST_PAGE_SIZE },
    enabled: enabled && Boolean(cardId),
  })
}

export function useCardStatementDetail(
  enabled: boolean,
  cardId: string | null,
  statementId: string | null
) {
  return useQuery({
    queryKey: [
      ...FINANCE_CARD_STATEMENTS_QUERY_KEY,
      cardId,
      "detail",
      statementId,
    ],
    queryFn: () =>
      apiGet<FinanceCardStatementDetail>(
        API_ENDPOINTS.FINANCE.CARD_STATEMENT(cardId!, statementId!)
      ),
    enabled: enabled && Boolean(cardId) && Boolean(statementId),
  })
}

export function useUpdateCardStatement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      cardId,
      statementId,
      body,
    }: {
      cardId: string
      statementId: string
      body: UpdateCardStatementBody
    }) =>
      apiPatch<void>(
        API_ENDPOINTS.FINANCE.CARD_STATEMENT(cardId, statementId),
        body
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: FINANCE_CARD_STATEMENTS_QUERY_KEY,
      })
    },
  })
}
