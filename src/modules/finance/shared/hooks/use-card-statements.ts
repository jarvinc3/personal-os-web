"use client"

import { apiGet } from "@/src/config/api-client"
import { cardStatementsQuery } from "@/src/modules/finance/shared/lib/finance-query-options"
import { FINANCE_CARD_STATEMENTS_QUERY_KEY } from "@/src/modules/finance/shared/types/api"
import type { FinanceCardStatementDetail } from "@/src/modules/finance/shared/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useQuery } from "@tanstack/react-query"

export function useCardStatements(enabled: boolean, cardId: string | null) {
  return useQuery({
    ...cardStatementsQuery(cardId ?? ""),
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
