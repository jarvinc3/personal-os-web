"use client"

import { apiGet } from "@/src/config/api-client"
import { useNotificationPreferences } from "@/src/modules/notifications/hooks/use-notification-preferences"
import type { UnreadCountResponse } from "@/src/modules/notifications/types/notification.types"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useAppStore } from "@/src/shared/store/app-store"
import { useQuery } from "@tanstack/react-query"

export const NOTIFICATIONS_UNREAD_QUERY_KEY = [
  "notifications",
  "unread-count",
] as const

export function useUnreadNotificationCount() {
  const session = useAppStore((state) => state.session)
  const { isInAppEnabled } = useNotificationPreferences()

  return useQuery({
    queryKey: NOTIFICATIONS_UNREAD_QUERY_KEY,
    queryFn: () =>
      apiGet<UnreadCountResponse>(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT),
    enabled: Boolean(session) && isInAppEnabled,
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 30,
  })
}
