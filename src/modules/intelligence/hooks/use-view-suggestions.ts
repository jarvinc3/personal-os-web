"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiDelete, apiGet } from "@/src/config/api-client"
import {
  viewSuggestionQueryString,
  type ViewSuggestionScope,
} from "@/src/modules/intelligence/lib/view-suggestions"
import type { ViewSuggestionsList } from "@/src/modules/intelligence/types/view-suggestions.types"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { appToast } from "@/src/shared/lib/app-toast"
import { useAppStore } from "@/src/shared/store/app-store"

export const VIEW_SUGGESTIONS_QUERY_KEY = [
  "intelligence",
  "view-suggestions",
] as const

export function useViewSuggestions(
  scope: ViewSuggestionScope,
  enabled: boolean
) {
  const session = useAppStore((state) => state.session)

  return useQuery({
    queryKey: [...VIEW_SUGGESTIONS_QUERY_KEY, scope],
    queryFn: ({ signal }) =>
      apiGet<ViewSuggestionsList>(
        `${API_ENDPOINTS.INTELLIGENCE.VIEW_SUGGESTIONS}?${viewSuggestionQueryString(scope)}`,
        signal
      ),
    enabled: Boolean(session && enabled),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })
}

export function useDismissViewSuggestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (suggestionId: string) =>
      apiDelete<{ dismissed: boolean }>(
        API_ENDPOINTS.INTELLIGENCE.VIEW_SUGGESTION(suggestionId)
      ),
    onSuccess: async (_response, suggestionId) => {
      queryClient.setQueriesData<ViewSuggestionsList>(
        { queryKey: VIEW_SUGGESTIONS_QUERY_KEY },
        (current) =>
          current
            ? {
                suggestions: current.suggestions.filter(
                  (suggestion) => suggestion.id !== suggestionId
                ),
              }
            : current
      )
      await queryClient.invalidateQueries({
        queryKey: VIEW_SUGGESTIONS_QUERY_KEY,
      })
    },
    onError: (error) => {
      appToast.error({
        text1: "No se pudo descartar la sugerencia",
        text2: error.message,
      })
    },
  })
}
