"use client"

import { apiGet } from "@/src/config/api-client"
import { useInfiniteFinanceList } from "@/src/modules/finance/shared/hooks/use-infinite-finance-list"
import { FINANCE_LIST_PAGE_SIZE } from "@/src/modules/finance/shared/lib/finance-query-options"
import { asFinanceArray } from "@/src/modules/finance/shared/lib/planning-lists"
import {
  FINANCE_LOANS_QUERY_KEY,
  type FinancePaginated,
} from "@/src/modules/finance/shared/types/api"
import type { FinanceLoanInstallment } from "@/src/modules/finance/shared/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useQuery } from "@tanstack/react-query"

export function useLoanInstallments(enabled: boolean, loanId: string | null) {
  return useInfiniteFinanceList<FinancePaginated<FinanceLoanInstallment>>({
    queryKey: [...FINANCE_LOANS_QUERY_KEY, "installments", loanId ?? ""],
    endpoint: API_ENDPOINTS.FINANCE.LOAN_INSTALLMENTS(loanId ?? ""),
    params: { limit: FINANCE_LIST_PAGE_SIZE },
    enabled: enabled && Boolean(loanId),
  })
}

/** Whole instalment projection, unpaginated; used by the amortization sheet. */
export function useLoanSchedule(enabled: boolean, loanId: string | null) {
  return useQuery({
    queryKey: [...FINANCE_LOANS_QUERY_KEY, "schedule", loanId ?? ""],
    queryFn: async () =>
      asFinanceArray<FinanceLoanInstallment>(
        await apiGet(API_ENDPOINTS.FINANCE.LOAN_SCHEDULE(loanId ?? ""))
      ),
    enabled: enabled && Boolean(loanId),
  })
}
