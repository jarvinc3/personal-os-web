"use client"

import { apiGet, apiPost } from "@/src/config/api-client"
import {
  EVIDENCE_QUERY_KEY,
  REVIEW_GROUPS_QUERY_KEY,
} from "@/src/modules/intelligence/constants/query-keys"
import { removeReviewQueueItem } from "@/src/modules/intelligence/review-queue"
import {
  reviewQueueApiSearchParams,
  type ReviewQueueApiQuery,
} from "@/src/modules/intelligence/review-queue-filters"
import type {
  AiAnalysisRunSummary,
  AiHumanVerificationInput,
  AiRunComparison,
  AiReviewQueuePage,
  AiReviewSelectionVerificationInput,
  AiReviewSelectionVerificationResult,
} from "@/src/modules/intelligence/types/intelligence.types"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useAppStore } from "@/src/shared/store/app-store"
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query"

export { EVIDENCE_QUERY_KEY } from "@/src/modules/intelligence/constants/query-keys"
const REVIEW_QUEUE_QUERY_KEY = [...EVIDENCE_QUERY_KEY, "review-queue"] as const

type ReviewQueueData = InfiniteData<AiReviewQueuePage>
type ReviewQueueSnapshot = Array<[QueryKey, ReviewQueueData | undefined]>

export function useAiEvidence(
  enabled: boolean,
  view: "review" | "runs" = "review",
  apiQuery: ReviewQueueApiQuery = {}
) {
  const session = useAppStore((state) => state.session)
  const queryClient = useQueryClient()
  const active = Boolean(session && enabled)
  const reviewQueueQuery = useInfiniteQuery({
    queryKey: [...REVIEW_QUEUE_QUERY_KEY, apiQuery],
    queryFn: ({ pageParam, signal }) => {
      const params = reviewQueueApiSearchParams(apiQuery)
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
  const evaluateMutation = useMutation({
    mutationFn: () =>
      apiPost<AiAnalysisRunSummary>(
        API_ENDPOINTS.INTELLIGENCE.EVALUATE_RUNS,
        {}
      ),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [...EVIDENCE_QUERY_KEY, "runs"],
      }),
  })
  const compareMutation = useMutation({
    mutationFn: ({
      firstRunId,
      secondRunId,
    }: {
      firstRunId: string
      secondRunId: string
    }) =>
      apiPost<AiRunComparison>(API_ENDPOINTS.INTELLIGENCE.COMPARE_RUNS, {
        firstRunId,
        secondRunId,
      }),
  })
  const verifyMutation = useMutation({
    mutationFn: ({
      messageId,
      input,
    }: {
      messageId: string
      input: AiHumanVerificationInput
    }) => apiPost(API_ENDPOINTS.INTELLIGENCE.VERIFY_MESSAGE(messageId), input),
    onMutate: async ({ messageId }) => {
      await queryClient.cancelQueries({ queryKey: REVIEW_QUEUE_QUERY_KEY })
      const previous = queryClient.getQueriesData<ReviewQueueData>({
        queryKey: REVIEW_QUEUE_QUERY_KEY,
      }) satisfies ReviewQueueSnapshot
      queryClient.setQueriesData<ReviewQueueData>(
        { queryKey: REVIEW_QUEUE_QUERY_KEY },
        (queue) => removeReviewQueueItem(queue, messageId)
      )
      return { previous }
    },
    onError: (_error, _variables, context) => {
      for (const [queryKey, data] of context?.previous ?? []) {
        queryClient.setQueryData(queryKey, data)
      }
    },
    onSettled: async (_, __, { messageId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: EVIDENCE_QUERY_KEY }),
        queryClient.invalidateQueries({
          queryKey: ["intelligence", "message", messageId],
        }),
      ])
    },
  })
  const verifySelectionMutation = useMutation({
    mutationFn: (input: AiReviewSelectionVerificationInput) =>
      apiPost<AiReviewSelectionVerificationResult>(
        API_ENDPOINTS.INTELLIGENCE.VERIFY_REVIEW_SELECTION,
        input
      ),
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: EVIDENCE_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: REVIEW_GROUPS_QUERY_KEY }),
        queryClient.invalidateQueries({
          queryKey: ["intelligence", "message"],
        }),
      ])
    },
  })

  return {
    reviewQueueQuery,
    runsQuery,
    verifyMutation,
    verifySelectionMutation,
    evaluateMutation,
    compareMutation,
  }
}
