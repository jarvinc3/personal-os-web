"use client"

import { apiGet, apiPost } from "@/src/config/api-client"
import {
  EVIDENCE_QUERY_KEY,
  REVIEW_GROUPS_QUERY_KEY,
} from "@/src/modules/intelligence/constants/query-keys"
import { REVIEW_GROUPS_PAGE_SIZE } from "@/src/modules/intelligence/review-groups"
import type {
  AiReviewGroupsPage,
  AiReviewGroupVerificationInput,
  AiReviewGroupVerificationResult,
} from "@/src/modules/intelligence/types/intelligence.types"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useAppStore } from "@/src/shared/store/app-store"
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

export { REVIEW_GROUPS_QUERY_KEY } from "@/src/modules/intelligence/constants/query-keys"

export function useReviewGroups(enabled: boolean) {
  const session = useAppStore((state) => state.session)
  const queryClient = useQueryClient()
  const groupsQuery = useInfiniteQuery({
    queryKey: REVIEW_GROUPS_QUERY_KEY,
    queryFn: ({ pageParam, signal }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        pageSize: String(REVIEW_GROUPS_PAGE_SIZE),
      })
      return apiGet<AiReviewGroupsPage>(
        `${API_ENDPOINTS.INTELLIGENCE.REVIEW_GROUPS}?${params.toString()}`,
        signal
      )
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: Boolean(session && enabled),
  })
  const batchMutation = useMutation({
    mutationFn: (input: AiReviewGroupVerificationInput) =>
      apiPost<AiReviewGroupVerificationResult>(
        API_ENDPOINTS.INTELLIGENCE.VERIFY_REVIEW_GROUP,
        input
      ),
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: REVIEW_GROUPS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: EVIDENCE_QUERY_KEY }),
      ])
    },
  })

  return { groupsQuery, batchMutation }
}
