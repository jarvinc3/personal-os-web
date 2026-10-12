"use client"

import { apiGet } from "@/src/config/api-client"
import {
  FINANCE_INSTRUMENT_HISTORY_QUERY_KEY,
  type FinancePaginated,
} from "@/src/modules/finance/shared/types/api"
import type { FinanceInstrumentHistoryItem } from "@/src/modules/finance/shared/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useInfiniteQuery } from "@tanstack/react-query"

export const FINANCE_INSTRUMENT_HISTORY_PAGE_SIZE = 20

export type InstrumentHistoryTarget =
  { kind: "account"; id: string } | { kind: "card"; id: string }

function historyPath(target: InstrumentHistoryTarget): string {
  return target.kind === "account"
    ? API_ENDPOINTS.FINANCE.ACCOUNT_HISTORY(target.id)
    : API_ENDPOINTS.FINANCE.CARD_HISTORY(target.id)
}

export function useInstrumentHistory(
  enabled: boolean,
  target: InstrumentHistoryTarget
) {
  return useInfiniteQuery({
    queryKey: [...FINANCE_INSTRUMENT_HISTORY_QUERY_KEY, target.kind, target.id],
    enabled,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => {
      const search = new URLSearchParams({
        limit: String(FINANCE_INSTRUMENT_HISTORY_PAGE_SIZE),
      })
      if (pageParam) {
        search.set("cursor", pageParam)
      }
      return apiGet<FinancePaginated<FinanceInstrumentHistoryItem>>(
        `${historyPath(target)}?${search.toString()}`
      )
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
  })
}
