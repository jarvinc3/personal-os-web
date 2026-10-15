"use client"

import { useInfiniteFinanceList } from "@/src/modules/finance/shared/hooks/use-infinite-finance-list"
import {
  FINANCE_INSTRUMENT_HISTORY_QUERY_KEY,
  type FinancePaginated,
} from "@/src/modules/finance/shared/types/api"
import type { FinanceInstrumentHistoryItem } from "@/src/modules/finance/shared/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"

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
  return useInfiniteFinanceList<FinancePaginated<FinanceInstrumentHistoryItem>>(
    {
      queryKey: [
        ...FINANCE_INSTRUMENT_HISTORY_QUERY_KEY,
        target.kind,
        target.id,
      ],
      endpoint: historyPath(target),
      params: { limit: FINANCE_INSTRUMENT_HISTORY_PAGE_SIZE },
      enabled,
    }
  )
}
