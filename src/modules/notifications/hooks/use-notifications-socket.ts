"use client"

import { getSupabaseBrowserClient } from "@/src/config/supabase/client"
import { useNotificationPreferences } from "@/src/modules/notifications/hooks/use-notification-preferences"
import { NOTIFICATIONS_QUERY_KEY } from "@/src/modules/notifications/hooks/use-notifications"
import { NOTIFICATIONS_UNREAD_QUERY_KEY } from "@/src/modules/notifications/hooks/use-unread-notification-count"
import { resolveNotificationsSocketUrl } from "@/src/modules/notifications/lib/notifications-socket-url"
import { showInAppNotificationToast } from "@/src/modules/notifications/lib/show-in-app-notification-toast"
import type { NotificationSocketPayload } from "@/src/modules/notifications/types/notification.types"
import { useAppStore } from "@/src/shared/store/app-store"
import { useQueryClient } from "@tanstack/react-query"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import { io, type Socket } from "socket.io-client"

function isNotificationsRoute(pathname: string): boolean {
  return pathname.includes("/notifications")
}

export function useNotificationsSocket() {
  const sessionUserId = useAppStore((state) => state.session?.userId ?? null)
  const sessionToken = useAppStore((state) => state.session?.token ?? null)
  const queryClient = useQueryClient()
  const { isInAppEnabled } = useNotificationPreferences()
  const pathname = usePathname()
  const pathnameRef = useRef(pathname)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    pathnameRef.current = pathname
  }, [pathname])

  useEffect(() => {
    const socket = socketRef.current
    if (socket && sessionToken) {
      socket.auth = { token: sessionToken }
    }
  }, [sessionToken])

  useEffect(() => {
    if (!sessionUserId || !isInAppEnabled) {
      socketRef.current?.disconnect()
      socketRef.current = null
      return
    }

    let cancelled = false
    let socket: Socket | null = null

    void (async () => {
      const {
        data: { session: authSession },
      } = await getSupabaseBrowserClient().auth.getSession()
      const token = authSession?.access_token
      if (!token || cancelled) {
        return
      }

      socket = io(`${resolveNotificationsSocketUrl()}/notifications`, {
        auth: { token },
        transports: ["websocket"],
      })

      socket.on("notification.new", (payload: NotificationSocketPayload) => {
        void queryClient.invalidateQueries({
          queryKey: NOTIFICATIONS_QUERY_KEY,
        })
        void queryClient.invalidateQueries({
          queryKey: NOTIFICATIONS_UNREAD_QUERY_KEY,
        })

        if (!isNotificationsRoute(pathnameRef.current)) {
          showInAppNotificationToast(payload)
        }
      })

      socketRef.current = socket
    })()

    return () => {
      cancelled = true
      socket?.disconnect()
      socketRef.current = null
    }
  }, [sessionUserId, isInAppEnabled, queryClient])
}
