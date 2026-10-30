"use client"

import { useNotificationPreferences } from "@/src/modules/notifications/hooks/use-notification-preferences"
import { NOTIFICATIONS_QUERY_KEY } from "@/src/modules/notifications/hooks/use-notifications"
import { NOTIFICATIONS_UNREAD_QUERY_KEY } from "@/src/modules/notifications/hooks/use-unread-notification-count"
import { showInAppNotificationToast } from "@/src/modules/notifications/lib/show-in-app-notification-toast"
import { useNotificationsSocketEvent } from "@/src/modules/notifications/providers/notifications-socket-provider"
import type { NotificationSocketPayload } from "@/src/modules/notifications/types/notification.types"
import { useQueryClient } from "@tanstack/react-query"
import { usePathname } from "next/navigation"

function isNotificationsRoute(pathname: string): boolean {
  return pathname.includes("/notifications")
}

export function useNotificationsSocket() {
  const queryClient = useQueryClient()
  const { isInAppEnabled } = useNotificationPreferences()
  const pathname = usePathname()

  useNotificationsSocketEvent<NotificationSocketPayload>(
    "notification.new",
    (payload) => {
      void queryClient.invalidateQueries({
        queryKey: NOTIFICATIONS_QUERY_KEY,
      })
      void queryClient.invalidateQueries({
        queryKey: NOTIFICATIONS_UNREAD_QUERY_KEY,
      })

      if (!isInAppEnabled || isNotificationsRoute(pathname)) {
        return
      }
      showInAppNotificationToast(payload)
    }
  )
}
