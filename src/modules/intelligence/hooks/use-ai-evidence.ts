"use client"

import { apiGet, apiPost } from "@/src/config/api-client"
import type {
  AiAnalysisRunSummary,
  AiDatasetSummary,
  AiHumanVerificationInput,
  AiReviewQueuePage,
} from "@/src/modules/intelligence/types/intelligence.types"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useAppStore } from "@/src/shared/store/app-store"
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

const EVIDENCE_QUERY_KEY = ["intelligence", "evidence"] as const

export function useAiEvidence(enabled: boolean) {
  const session = useAppStore((state) => state.session)
  const queryClient = useQueryClient()
  const active = Boolean(session && enabled)
  const datasetQuery = useQuery({
    queryKey: [...EVIDENCE_QUERY_KEY, "dataset"],
    queryFn: ({ signal }) =>
      apiGet<AiDatasetSummary>(API_ENDPOINTS.INTELLIGENCE.DATASET, signal),
    enabled: active,
  })
  const reviewQueueQuery = useInfiniteQuery({
    queryKey: [...EVIDENCE_QUERY_KEY, "review-queue"],
    queryFn: ({ pageParam, signal }) => {
      const params = new URLSearchParams()
      if (pageParam) {
        params.set("cursor", pageParam)
      }
      const query = params.size ? `?${params.toString()}` : ""
      return apiGet<AiReviewQueuePage>(
        `${API_ENDPOINTS.INTELLIGENCE.REVIEW_QUEUE}${query}`,
        signal
      )
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    enabled: active,
  })
  const runsQuery = useQuery({
    queryKey: [...EVIDENCE_QUERY_KEY, "runs"],
    queryFn: ({ signal }) =>
      apiGet<AiAnalysisRunSummary[]>(API_ENDPOINTS.INTELLIGENCE.RUNS, signal),
    enabled: active,
  })
  const verifyMutation = useMutation({
    mutationFn: ({
      messageId,
      input,
    }: {
      messageId: string
      input: AiHumanVerificationInput
    }) => apiPost(API_ENDPOINTS.INTELLIGENCE.VERIFY_MESSAGE(messageId), input),
    onSuccess: async (_, { messageId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [...EVIDENCE_QUERY_KEY] }),
        queryClient.invalidateQueries({
          queryKey: ["intelligence", "message", messageId],
        }),
      ])
    },
  })

  return { datasetQuery, reviewQueueQuery, runsQuery, verifyMutation }
}
