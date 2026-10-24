"use client"

import {
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
    <>
      <AppEffects />
      {children}
    </>
  )
}
