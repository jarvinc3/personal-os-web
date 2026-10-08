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
        page: String(pageParam),
        limit: String(NOTIFICATIONS_PAGE_SIZE),
      })
      return apiGet<PaginatedNotifications>(
        `${API_ENDPOINTS.NOTIFICATIONS.LIST}?${params.toString()}`
      )
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined,
    enabled: Boolean(session),
    staleTime: 1000 * 15,
    refetchOnWindowFocus: true,
  })
}
