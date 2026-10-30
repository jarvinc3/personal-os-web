"use client"

import {
  NotificationsSocketProvider,
  useNotificationsSocket,
  usePushToken,
} from "@/src/modules/notifications"
import {
  useApplyAppearancePreference,
  useApplyThemePreference,
} from "@/src/modules/settings"

function AppEffects() {
  useApplyThemePreference()
  useApplyAppearancePreference()
  useNotificationsSocket()
  usePushToken()
  return null
}

export function AppEffectsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NotificationsSocketProvider>
      <AppEffects />
      {children}
    </NotificationsSocketProvider>
  )
}
