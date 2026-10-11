"use client"

import { useAiSocket } from "@/src/modules/ai"
import {
  useNotificationsSocket,
  usePushToken,
} from "@/src/modules/notifications"
import { useApplyThemePreference } from "@/src/modules/settings"

function AppEffects() {
  useApplyThemePreference()
  useNotificationsSocket()
  useAiSocket()
  usePushToken()
  return null
}

export function AppEffectsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AppEffects />
      {children}
    </>
  )
}
