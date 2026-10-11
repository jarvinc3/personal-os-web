"use client"

import { apiGet } from "@/src/config/api-client"
import type { PaginatedNotifications } from "@/src/modules/notifications/types/notification.types"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useAppStore } from "@/src/shared/store/app-store"
import { useInfiniteQuery } from "@tanstack/react-query"

export const NOTIFICATIONS_QUERY_KEY = ["notifications", "list"] as const
export const NOTIFICATIONS_PAGE_SIZE = 20

export function useNotifications() {
  const session = useAppStore((state) => state.session)

  return useInfiniteQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({
        channel: "IN_APP",
        limit: String(NOTIFICATIONS_PAGE_SIZE),
      })
      if (pageParam) {
        params.set("cursor", pageParam)
      }
      return apiGet<PaginatedNotifications>(
        `${API_ENDPOINTS.NOTIFICATIONS.LIST}?${params.toString()}`
      )
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(session),
    staleTime: 1000 * 15,
    refetchOnWindowFocus: true,
  })
}
