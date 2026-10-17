"use client"

import { apiGet, apiPatch, apiPost } from "@/src/config/api-client"
import type {
  CreateReceivableShareBody,
  FinanceReceivableShare,
} from "@/src/modules/finance/receivables/lib/receivable-share"
import type { PublicReceivableShare } from "@/src/modules/finance/receivables/lib/public-receivable-share"
import {
  FINANCE_RECEIVABLE_SHARES_QUERY_KEY,
  PUBLIC_RECEIVABLE_SHARE_QUERY_KEY,
} from "@/src/modules/finance/shared/types/api"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useCreateReceivableShare() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateReceivableShareBody) =>
      apiPost<FinanceReceivableShare>(
        API_ENDPOINTS.FINANCE.RECEIVABLE_SHARES,
        body
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: FINANCE_RECEIVABLE_SHARES_QUERY_KEY,
      })
    },
  })
}

export function useRevokeReceivableShare() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (shareId: string) =>
      apiPatch<FinanceReceivableShare>(
        API_ENDPOINTS.FINANCE.RECEIVABLE_SHARE_REVOKE(shareId)
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: FINANCE_RECEIVABLE_SHARES_QUERY_KEY,
      })
    },
  })
}

/** Public read: no session, so a 404 is final and nothing is retried here. */
export function usePublicReceivableShare(token: string | null) {
  return useQuery({
    queryKey: [PUBLIC_RECEIVABLE_SHARE_QUERY_KEY, token ?? ""],
    queryFn: () =>
      apiGet<PublicReceivableShare>(
        API_ENDPOINTS.FINANCE.PUBLIC_RECEIVABLE_SHARE(token ?? "")
      ),
    enabled: Boolean(token),
    retry: false,
  })
}
