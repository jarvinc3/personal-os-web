"use client"

import { cardStatementsQuery } from "@/src/modules/finance/lib/finance-query-options"
import { useQuery } from "@tanstack/react-query"

export function useCardStatements(enabled: boolean, cardId: string | null) {
  return useQuery({
    ...cardStatementsQuery(cardId ?? ""),
    enabled: enabled && Boolean(cardId),
  })
}
