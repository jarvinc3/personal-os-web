"use client"

import { apiDelete, apiPatch, apiPost } from "@/src/config/api-client"
import type {
  CreateCategoryBody,
  UpdateCategoryBody,
} from "@/src/modules/finance/shared/lib/catalog-payloads"
import { categoriesQuery } from "@/src/modules/finance/shared/lib/finance-query-options"
import { FINANCE_CATEGORIES_QUERY_KEY } from "@/src/modules/finance/shared/types/api"
import type { FinanceCategory } from "@/src/modules/finance/shared/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

function invalidateCategories(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: FINANCE_CATEGORIES_QUERY_KEY })
}

export function useCategories(enabled: boolean) {
  return useQuery({
    ...categoriesQuery(),
    enabled,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateCategoryBody) =>
      apiPost<FinanceCategory>(API_ENDPOINTS.FINANCE.CATEGORIES, body),
    onSuccess: () => invalidateCategories(queryClient),
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string
      body: Partial<UpdateCategoryBody>
    }) => apiPatch<FinanceCategory>(API_ENDPOINTS.FINANCE.CATEGORY(id), body),
    onSuccess: () => invalidateCategories(queryClient),
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(API_ENDPOINTS.FINANCE.CATEGORY(id)),
    onSuccess: () => invalidateCategories(queryClient),
  })
}
