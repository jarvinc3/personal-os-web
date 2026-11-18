"use client"

import { apiGet } from "@/src/config/api-client"
import { readImportReviewItem } from "@/src/modules/finance/imports-review/lib/import-review-view"
import { FINANCE_IMPORTS_REVIEW_QUERY_KEY } from "@/src/modules/finance/shared/types/api"
import type { ImportReviewItemPayload } from "@/src/modules/finance/shared/types/entities"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useQuery } from "@tanstack/react-query"

/** La cola de imports de correo que esperan una decisión humana. */
export function useImportReviewQueue(enabled: boolean) {
  return useQuery({
    queryKey: FINANCE_IMPORTS_REVIEW_QUERY_KEY,
    queryFn: async ({ signal }) => {
      const payload = await apiGet<ImportReviewItemPayload[]>(
        API_ENDPOINTS.FINANCE.IMPORTS_REVIEW,
        signal
      )
      return payload.map((item) => readImportReviewItem(item))
    },
    enabled,
  })
}
