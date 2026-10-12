"use client"

import {
  apiDelete,
  apiPatch,
  apiPost,
  apiPostForm,
} from "@/src/config/api-client"
import type { CreateInstitutionBody } from "@/src/modules/finance/shared/lib/catalog-payloads"
import {
  invalidateFinanceBalanceSheet,
  invalidateFinancePositions,
} from "./use-balance-sheet"
import { institutionsQuery } from "@/src/modules/finance/shared/lib/finance-query-options"
import {
  FINANCE_ACCOUNTS_QUERY_KEY,
  FINANCE_CARDS_QUERY_KEY,
  FINANCE_EMAIL_SOURCES_QUERY_KEY,
  FINANCE_INSTITUTIONS_QUERY_KEY,
  FINANCE_LOANS_QUERY_KEY,
} from "@/src/modules/finance/shared/types/api"
import type { FinanceInstitution } from "@/src/modules/finance/shared/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

function invalidateCatalog(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({
    queryKey: FINANCE_INSTITUTIONS_QUERY_KEY,
  })
  void queryClient.invalidateQueries({ queryKey: FINANCE_ACCOUNTS_QUERY_KEY })
  void queryClient.invalidateQueries({ queryKey: FINANCE_CARDS_QUERY_KEY })
  invalidateFinanceBalanceSheet(queryClient)
}

export function useInstitutions(enabled: boolean) {
  return useQuery({
    ...institutionsQuery(),
    enabled,
  })
}

export function useCreateInstitution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateInstitutionBody) =>
      apiPost<FinanceInstitution>(API_ENDPOINTS.FINANCE.INSTITUTIONS, body),
    onSuccess: () => invalidateCatalog(queryClient),
  })
}

export function useUpdateInstitution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      apiPatch<FinanceInstitution>(API_ENDPOINTS.FINANCE.INSTITUTION(id), body),
    onSuccess: () => invalidateCatalog(queryClient),
  })
}

export function useArchiveInstitution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiPatch<FinanceInstitution>(API_ENDPOINTS.FINANCE.INSTITUTION(id), {
        isActive: false,
      }),
    onSuccess: () => invalidateCatalog(queryClient),
  })
}

export function useUnarchiveInstitution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiPatch<FinanceInstitution>(API_ENDPOINTS.FINANCE.INSTITUTION(id), {
        isActive: true,
      }),
    onSuccess: () => invalidateCatalog(queryClient),
  })
}

export function useUploadInstitutionLogo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => {
      const body = new FormData()
      body.append("file", file)
      return apiPostForm<FinanceInstitution>(
        API_ENDPOINTS.FINANCE.INSTITUTION_LOGO(id),
        body
      )
    },
    onSuccess: () => invalidateCatalog(queryClient),
  })
}

export function useDeleteInstitution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiDelete(API_ENDPOINTS.FINANCE.INSTITUTION(id)),
    onSuccess: () => {
      invalidateCatalog(queryClient)
      invalidateFinancePositions(queryClient)
      void queryClient.invalidateQueries({ queryKey: FINANCE_LOANS_QUERY_KEY })
      void queryClient.invalidateQueries({
        queryKey: FINANCE_EMAIL_SOURCES_QUERY_KEY,
      })
    },
  })
}

export function useRestoreInstitution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiPost<{ success: boolean }>(
        API_ENDPOINTS.FINANCE.INSTITUTION_RESTORE(id)
      ),
    onSuccess: () => {
      invalidateCatalog(queryClient)
      invalidateFinancePositions(queryClient)
      void queryClient.invalidateQueries({ queryKey: FINANCE_LOANS_QUERY_KEY })
      void queryClient.invalidateQueries({
        queryKey: FINANCE_EMAIL_SOURCES_QUERY_KEY,
      })
    },
  })
}
