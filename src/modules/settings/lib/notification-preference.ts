import type {
  DeepPartial,
  NotificationsPreference,
  UserPreferences,
} from "@/src/modules/settings/types/profile.types"

export type NotificationChannel = "email" | "inApp" | "push"

export type NotificationPreferenceChange = {
  patch: DeepPartial<UserPreferences>
  successMessage: string
}

const CHANNEL_MESSAGES = {
  push: "Preferencia de push actualizada.",
  email: "Preferencia de email actualizada.",
  inApp: "Preferencia in-app actualizada.",
} satisfies Record<NotificationChannel, string>

function channelPatch(
  channel: NotificationChannel,
  enabled: boolean
): DeepPartial<NotificationsPreference>["channels"] {
  switch (channel) {
    case "push":
      return { push: enabled }
    case "email":
      return { email: enabled }
    case "inApp":
      return { inApp: enabled }
    default: {
      const unhandled: never = channel
      throw new Error(`Canal de notificación no manejado: ${String(unhandled)}`)
    }
  }
}

export function channelPreferenceChange(
  channel: NotificationChannel,
  enabled: boolean
): NotificationPreferenceChange {
  return {
    patch: { notifications: { channels: channelPatch(channel, enabled) } },
    successMessage: CHANNEL_MESSAGES[channel],
  }
}

export function quietHoursPreferenceChange(
  enabled: boolean
): NotificationPreferenceChange {
  return {
    patch: { notifications: { quietHours: { enabled } } },
    successMessage: "Horario silencioso actualizado.",
  }
}
