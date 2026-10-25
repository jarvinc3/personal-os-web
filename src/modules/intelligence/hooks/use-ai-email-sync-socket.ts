"use client"

import { getSupabaseBrowserClient } from "@/src/config/supabase/client"
import type {
  AiEmailSyncProgress,
  IntelligenceDashboard,
} from "@/src/modules/intelligence/types/intelligence.types"
import { resolveNotificationsSocketUrl } from "@/src/modules/notifications/lib/notifications-socket-url"
import { useAppStore } from "@/src/shared/store/app-store"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { io } from "socket.io-client"

type SyncUpdatePayload = { state: AiEmailSyncProgress }
const INTELLIGENCE_QUERY_KEY = ["intelligence", "dashboard"] as const

export function useAiEmailSyncSocket() {
  const userId = useAppStore((state) => state.session?.userId ?? null)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!userId) {
      return
    }

    let cancelled = false
    let socket: ReturnType<typeof io> | null = null

    void (async () => {
      const {
        data: { session },
      } = await getSupabaseBrowserClient().auth.getSession()
      if (!session?.access_token || cancelled) {
        return
      }

      socket = io(`${resolveNotificationsSocketUrl()}/notifications`, {
        auth: { token: session.access_token },
        transports: ["websocket"],
        forceNew: true,
      })
      socket.on("ai.email.sync.updated", ({ state }: SyncUpdatePayload) => {
        queryClient.setQueryData<IntelligenceDashboard>(
          INTELLIGENCE_QUERY_KEY,
          (dashboard) => {
            if (!dashboard?.connection.connected) {
              return dashboard
            }
            return {
              ...dashboard,
              connection: {
                ...dashboard.connection,
                syncProgress: state,
                syncInProgress: ["running", "waiting", "retrying"].includes(
                  state.status
                ),
              },
            }
          }
        )

        if (["scheduled", "completed", "failed"].includes(state.status)) {
          void queryClient.invalidateQueries({
            queryKey: INTELLIGENCE_QUERY_KEY,
          })
          void queryClient.invalidateQueries({
            queryKey: ["intelligence", "messages"],
          })
          void queryClient.invalidateQueries({
            queryKey: ["intelligence", "evidence"],
          })
        }
      })
      socket.on("connect", () => {
        void queryClient.invalidateQueries({
          queryKey: INTELLIGENCE_QUERY_KEY,
        })
      })
    })()

    return () => {
      cancelled = true
      socket?.disconnect()
      socket = null
    }
  }, [userId, queryClient])
}
