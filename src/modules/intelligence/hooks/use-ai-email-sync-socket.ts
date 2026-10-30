"use client"

import type {
  AiEmailSyncProgress,
  IntelligenceDashboard,
} from "@/src/modules/intelligence/types/intelligence.types"
import {
  useNotificationsSocketEvent,
  useNotificationsSocketStatus,
} from "@/src/modules/notifications"
import { useQueryClient } from "@tanstack/react-query"

type SyncUpdatePayload = { state: AiEmailSyncProgress }
const INTELLIGENCE_QUERY_KEY = ["intelligence", "dashboard"] as const

export function useAiEmailSyncSocket() {
  const queryClient = useQueryClient()

  useNotificationsSocketEvent<SyncUpdatePayload>(
    "ai.email.sync.updated",
    ({ state }) => {
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
    }
  )

  return useNotificationsSocketStatus()
}
