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
import { useCallback, useState } from "react"

type SyncUpdatePayload = { state: AiEmailSyncProgress }
const INTELLIGENCE_QUERY_KEY = ["intelligence", "dashboard"] as const
const SYNC_EVENT_STATUSES: ReadonlySet<AiEmailSyncProgress["status"]> = new Set(
  ["scheduled", "completed", "failed"]
)

export function useAiEmailSyncSocket() {
  const queryClient = useQueryClient()
  const status = useNotificationsSocketStatus()
  const [hasPendingMessageUpdates, setHasPendingMessageUpdates] =
    useState(false)
  const markMessagesPending = useCallback(
    () => setHasPendingMessageUpdates(true),
    []
  )
  const acknowledgeMessages = useCallback(
    () => setHasPendingMessageUpdates(false),
    []
  )

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

      if (SYNC_EVENT_STATUSES.has(state.status)) {
        void queryClient.invalidateQueries({
          queryKey: INTELLIGENCE_QUERY_KEY,
        })
        void queryClient.invalidateQueries({
          queryKey: ["intelligence", "evidence"],
        })
        markMessagesPending()
      }
    }
  )

  return {
    status,
    hasPendingMessageUpdates,
    markMessagesPending,
    acknowledgeMessages,
  }
}
