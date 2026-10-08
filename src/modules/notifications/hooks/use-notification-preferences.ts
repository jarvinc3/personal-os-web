"use client"

import { PROFILE_QUERY_KEY } from "@/src/modules/auth/lib/hydrate-auth-user"
import { normalizeUserPreferences } from "@/src/modules/settings/lib/normalize-preferences"
import { isWithinQuietHours } from "@/src/modules/settings/lib/quiet-hours"
import type {
  NotificationChannelPreferences,
  NotificationsPreference,
  QuietHoursPreference,
  UserProfile,
} from "@/src/modules/settings/types/profile.types"
import { useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"

export function useNotificationPreferences() {
  const queryClient = useQueryClient()
  const profile = queryClient.getQueryData<UserProfile>(PROFILE_QUERY_KEY)

  return useMemo(() => {
    const preferences = normalizeUserPreferences(profile?.preferences)
    const notifications: NotificationsPreference = preferences.notifications
    const channels: NotificationChannelPreferences = notifications.channels
    const quietHours: QuietHoursPreference = {
      ...notifications.quietHours,
      timezone: notifications.quietHours.timezone ?? profile?.timezone ?? null,
    }

    const isInAppEnabled = channels.inApp
    const isPushEnabled = channels.push
    const isEmailEnabled = channels.email
    const quietHoursActive = isWithinQuietHours({
      enabled: quietHours.enabled,
      start: quietHours.start,
      end: quietHours.end,
      timezone: quietHours.timezone,
    })

    return {
      channels,
      quietHours,
      isInAppEnabled,
      isPushEnabled,
      isEmailEnabled,
      quietHoursActive,
      isWithinQuietHours: (now?: Date) =>
        isWithinQuietHours({
          enabled: quietHours.enabled,
          start: quietHours.start,
          end: quietHours.end,
          timezone: quietHours.timezone,
          now,
        }),
    }
  }, [profile?.preferences, profile?.timezone])
}
