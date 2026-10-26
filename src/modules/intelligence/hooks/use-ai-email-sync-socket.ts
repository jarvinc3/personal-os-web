"use client"

import { getSupabaseBrowserClient } from "@/src/config/supabase/client"
import type {
  AiEmailSyncProgress,
  IntelligenceDashboard,
} from "@/src/modules/intelligence/types/intelligence.types"
import { resolveNotificationsSocketUrl } from "@/src/modules/notifications/lib/notifications-socket-url"
import { useAppStore } from "@/src/shared/store/app-store"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { io } from "socket.io-client"

type SyncUpdatePayload = { state: AiEmailSyncProgress }
export type AiEmailSocketStatus = "connecting" | "connected" | "disconnected"
const INTELLIGENCE_QUERY_KEY = ["intelligence", "dashboard"] as const

export function useAiEmailSyncSocket() {
  const userId = useAppStore((state) => state.session?.userId ?? null)
  const queryClient = useQueryClient()
  const [socketState, setSocketState] = useState<{
    userId: string | null
    status: AiEmailSocketStatus
  }>({ userId: null, status: "connecting" })

  useEffect(() => {
    if (!userId) {
      return
    }

    let cancelled = false
    let socket: ReturnType<typeof io> | null = null
    const updateStatus = (status: AiEmailSocketStatus) => {
      setSocketState({ userId, status })
    }

    void (async () => {
      let session
      try {
        const result = await getSupabaseBrowserClient().auth.getSession()
        session = result.data.session
      } catch {
        if (!cancelled) {
          updateStatus("disconnected")
        }
        return
      }
      if (!session?.access_token || cancelled) {
        if (!cancelled) {
          updateStatus("disconnected")
        }
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
        updateStatus("connected")
        void queryClient.invalidateQueries({
          queryKey: INTELLIGENCE_QUERY_KEY,
        })
      })
      socket.on("disconnect", () => updateStatus("disconnected"))
      socket.on("connect_error", () => updateStatus("disconnected"))
      socket.io.on("reconnect_attempt", () => updateStatus("connecting"))
    })()

    return () => {
      cancelled = true
      socket?.disconnect()
      socket = null
    }
  }, [userId, queryClient])

  if (!userId) {
    return "disconnected"
  }
  return socketState.userId === userId ? socketState.status : "connecting"
}
