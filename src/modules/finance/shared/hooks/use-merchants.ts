"use client"

import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPostForm,
} from "@/src/config/api-client"
import { useInfiniteFinanceList } from "@/src/modules/finance/shared/hooks/use-infinite-finance-list"
import {
  FINANCE_MERCHANTS_QUERY_KEY,
  FINANCE_RECURRING_QUERY_KEY,
  FINANCE_TRANSACTIONS_QUERY_KEY,
  type FinancePaginated,
} from "@/src/modules/finance/shared/types/api"
import type {
  FinanceMerchant,
  FinanceMerchantDuplicate,
  FinanceMerchantSuggestion,
} from "@/src/modules/finance/shared/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const FINANCE_MERCHANT_PAGE_SIZE = 20

export type MerchantsQueryParams = {
  search?: string
  dateFrom?: string
  dateTo?: string
}

function invalidateMerchants(
  queryClient: ReturnType<typeof useQueryClient>
): void {
  void queryClient.invalidateQueries({
    queryKey: FINANCE_MERCHANTS_QUERY_KEY,
  })
  void queryClient.invalidateQueries({
    queryKey: FINANCE_TRANSACTIONS_QUERY_KEY,
  })
  void queryClient.invalidateQueries({ queryKey: FINANCE_RECURRING_QUERY_KEY })
}

export function useMerchants(
  enabled: boolean,
  params: MerchantsQueryParams = {}
) {
  return useInfiniteFinanceList<FinancePaginated<FinanceMerchant>>({
    queryKey: [...FINANCE_MERCHANTS_QUERY_KEY, "list", params],
    endpoint: API_ENDPOINTS.FINANCE.MERCHANTS,
    params: { limit: FINANCE_MERCHANT_PAGE_SIZE, ...params },
    enabled,
  })
}

export function useMerchant(enabled: boolean, id: string | null) {
  return useQuery({
    queryKey: [...FINANCE_MERCHANTS_QUERY_KEY, "detail", id],
    queryFn: () => apiGet<FinanceMerchant>(API_ENDPOINTS.FINANCE.MERCHANT(id!)),
    enabled: enabled && Boolean(id),
  })
}

export function useMerchantSuggest(enabled: boolean, merchant: string) {
  const trimmed = merchant.trim()
  return useQuery({
    queryKey: [...FINANCE_MERCHANTS_QUERY_KEY, "suggest", trimmed],
    queryFn: () =>
      apiGet<FinanceMerchantSuggestion>(
        `${API_ENDPOINTS.FINANCE.MERCHANT_SUGGEST}?merchant=${encodeURIComponent(trimmed)}`
      ),
    enabled: enabled && trimmed.length >= 2,
    staleTime: 60_000,
  })
}

export function useUpdateMerchant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      apiPatch<FinanceMerchant>(API_ENDPOINTS.FINANCE.MERCHANT(id), body),
    onSuccess: () => invalidateMerchants(queryClient),
  })
}

export function useMergeMerchant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, targetId }: { id: string; targetId: string }) =>
      apiPost<FinanceMerchant>(API_ENDPOINTS.FINANCE.MERCHANT_MERGE(id), {
        targetId,
      }),
    onSuccess: () => invalidateMerchants(queryClient),
  })
}

export function useUploadMerchantLogo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => {
      const body = new FormData()
      body.append("file", file)
      return apiPostForm<FinanceMerchant>(
        API_ENDPOINTS.FINANCE.MERCHANT_LOGO(id),
        body
      )
    },
    onSuccess: () => invalidateMerchants(queryClient),
  })
}

export function useMerchantDuplicates(enabled: boolean, id: string | null) {
  return useQuery({
    queryKey: [...FINANCE_MERCHANTS_QUERY_KEY, "duplicates", id],
    queryFn: () =>
      apiGet<FinanceMerchantDuplicate[]>(
        API_ENDPOINTS.FINANCE.MERCHANT_DUPLICATES(id!)
      ),
    enabled: enabled && Boolean(id),
  })
}

/** «No es duplicado»: the pair stops being suggested. */
export function useDismissMerchantDuplicate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, otherId }: { id: string; otherId: string }) =>
      apiPost<{ dismissed: boolean }>(
        API_ENDPOINTS.FINANCE.MERCHANT_DUPLICATE_DISMISS(id, otherId)
      ),
    onSuccess: () => invalidateMerchants(queryClient),
  })
}

export function useUndoDismissMerchantDuplicate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, otherId }: { id: string; otherId: string }) =>
      apiDelete<{ dismissed: boolean }>(
        API_ENDPOINTS.FINANCE.MERCHANT_DUPLICATE_DISMISS(id, otherId)
      ),
    onSuccess: () => invalidateMerchants(queryClient),
  })
}

/** Removes the own logo so the initials come back. */
export function useDeleteMerchantLogo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiDelete<FinanceMerchant>(API_ENDPOINTS.FINANCE.MERCHANT_LOGO(id)),
    onSuccess: () => invalidateMerchants(queryClient),
  })
}
