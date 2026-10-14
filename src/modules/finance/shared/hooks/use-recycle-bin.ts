"use client"

import { apiPatch, apiPost } from "@/src/config/api-client"
import { useInfiniteFinanceList } from "./use-infinite-finance-list"
import { FINANCE_LIST_PAGE_SIZE } from "@/src/modules/finance/shared/lib/finance-query-options"
import {
  FINANCE_QUERY_KEY,
  FINANCE_RECYCLE_BIN_QUERY_KEY,
  type FinanceArchivedRecord,
  type FinanceArchivedType,
  type FinanceDeletedRecord,
  type FinanceDeletedType,
  type FinanceRecycleBinPage,
} from "@/src/modules/finance/shared/types/api"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useMutation, useQueryClient } from "@tanstack/react-query"

const DELETED_RESTORE_ENDPOINT: Record<
  FinanceDeletedType,
  (id: string) => string
> = {
  institution: API_ENDPOINTS.FINANCE.INSTITUTION_RESTORE,
  account: API_ENDPOINTS.FINANCE.ACCOUNT_RESTORE,
  card: API_ENDPOINTS.FINANCE.CARD_RESTORE,
  loan: API_ENDPOINTS.FINANCE.LOAN_RESTORE,
  transaction: API_ENDPOINTS.FINANCE.TRANSACTION_RESTORE,
  category: API_ENDPOINTS.FINANCE.CATEGORY_RESTORE,
  budget: API_ENDPOINTS.FINANCE.BUDGET_RESTORE,
  savingsGoal: API_ENDPOINTS.FINANCE.SAVINGS_GOAL_RESTORE,
  receivable: API_ENDPOINTS.FINANCE.RECEIVABLE_RESTORE,
}

const ARCHIVED_RESTORE_ENDPOINT: Record<
  FinanceArchivedType,
  (id: string) => string
> = {
  institution: API_ENDPOINTS.FINANCE.INSTITUTION,
  account: API_ENDPOINTS.FINANCE.ACCOUNT,
  card: API_ENDPOINTS.FINANCE.CARD,
  loan: API_ENDPOINTS.FINANCE.LOAN,
}

export function useRecycleBin(enabled: boolean) {
  return useInfiniteFinanceList<FinanceRecycleBinPage>({
    queryKey: FINANCE_RECYCLE_BIN_QUERY_KEY,
    endpoint: API_ENDPOINTS.FINANCE.RECYCLE_BIN,
    params: { limit: FINANCE_LIST_PAGE_SIZE },
    enabled,
  })
}

export type RecycleBinRestoreInput =
  | { kind: "archived"; record: FinanceArchivedRecord }
  | { kind: "deleted"; record: FinanceDeletedRecord }

export function useRecycleBinRestore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: RecycleBinRestoreInput) => {
      if (input.kind === "archived") {
        return apiPatch(
          ARCHIVED_RESTORE_ENDPOINT[input.record.type](input.record.id),
          { isActive: true }
        )
      }
      return apiPost(
        DELETED_RESTORE_ENDPOINT[input.record.type](input.record.id)
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FINANCE_QUERY_KEY })
    },
  })
}
