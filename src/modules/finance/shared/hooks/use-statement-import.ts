"use client"

import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPostForm,
} from "@/src/config/api-client"
import {
  FINANCE_QUERY_KEY,
  FINANCE_STATEMENT_IMPORTS_QUERY_KEY,
} from "@/src/modules/finance/shared/types/api"
import type {
  FinanceStatementImport,
  FinanceStatementLineDecision,
} from "@/src/modules/finance/shared/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

const PENDING_STATUSES = new Set(["PARSING"])
const POLL_INTERVAL_MS = 1500

function importQueryKey(importId: string | null) {
  return [...FINANCE_STATEMENT_IMPORTS_QUERY_KEY, importId] as const
}

export function useStatementImport(enabled: boolean, importId: string | null) {
  return useQuery({
    queryKey: importQueryKey(importId),
    queryFn: () =>
      apiGet<FinanceStatementImport>(
        API_ENDPOINTS.FINANCE.STATEMENT_IMPORT(importId!)
      ),
    enabled: enabled && Boolean(importId),
    refetchInterval: (query) =>
      query.state.data?.status && PENDING_STATUSES.has(query.state.data.status)
        ? POLL_INTERVAL_MS
        : false,
  })
}

export type UploadStatementImportInput = {
  cardId?: string
  accountId?: string
  file: File
  password?: string
}

export function useUploadStatementImport() {
  return useMutation({
    mutationFn: ({
      cardId,
      accountId,
      file,
      password,
    }: UploadStatementImportInput) => {
      const form = new FormData()
      form.append("file", file)
      if (password) {
        form.append("password", password)
      }
      const path = cardId
        ? API_ENDPOINTS.FINANCE.CARD_STATEMENT_IMPORT(cardId)
        : API_ENDPOINTS.FINANCE.ACCOUNT_STATEMENT_IMPORT(accountId ?? "")
      return apiPostForm<{ importId: string }>(path, form)
    },
  })
}

export function useUpdateStatementLine(importId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      lineId,
      decision,
      transactionId,
    }: {
      lineId: string
      decision: FinanceStatementLineDecision
      transactionId?: string
    }) =>
      apiPatch<FinanceStatementImport>(
        API_ENDPOINTS.FINANCE.STATEMENT_IMPORT_LINE(importId, lineId),
        { decision, ...(transactionId ? { transactionId } : {}) }
      ),
    onSuccess: (updated) => {
      queryClient.setQueryData(importQueryKey(importId), updated)
    },
  })
}

export function useApplyStatementImport(importId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (adjust: boolean) =>
      apiPost<FinanceStatementImport>(
        API_ENDPOINTS.FINANCE.STATEMENT_IMPORT_APPLY(importId),
        { adjust }
      ),
    onSuccess: (updated) => {
      queryClient.setQueryData(importQueryKey(importId), updated)
      void queryClient.invalidateQueries({ queryKey: FINANCE_QUERY_KEY })
    },
  })
}

export function useDiscardStatementImport(importId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () =>
      apiDelete<void>(API_ENDPOINTS.FINANCE.STATEMENT_IMPORT(importId)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: FINANCE_STATEMENT_IMPORTS_QUERY_KEY,
      })
    },
  })
}
