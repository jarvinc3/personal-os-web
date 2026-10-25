"use client"

import { apiGet, apiPost } from "@/src/config/api-client"
import type {
  AiAnalysisRunSummary,
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

export function useAiEvidence(
  enabled: boolean,
  view: "review" | "runs" = "review",
  partition: "TRAIN" | "VALIDATION" | "HOLDOUT" | "ALL" = "ALL"
) {
  const session = useAppStore((state) => state.session)
  const queryClient = useQueryClient()
  const active = Boolean(session && enabled)
  const reviewQueueQuery = useInfiniteQuery({
    queryKey: [...EVIDENCE_QUERY_KEY, "review-queue", partition],
    queryFn: ({ pageParam, signal }) => {
      const params = new URLSearchParams()
      if (partition !== "ALL") {
        params.set("partition", partition)
      }
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
    enabled: active && view === "review",
  })
  const runsQuery = useQuery({
    queryKey: [...EVIDENCE_QUERY_KEY, "runs"],
    queryFn: ({ signal }) =>
      apiGet<AiAnalysisRunSummary[]>(API_ENDPOINTS.INTELLIGENCE.RUNS, signal),
    enabled: active && view === "runs",
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

  return { reviewQueueQuery, runsQuery, verifyMutation }
}
