"use client"

import type { NotificationPreferenceToggle } from "@/src/modules/notifications/hooks/use-notification-preference-toggle"
import { deactivatePushTokenIfPresent } from "@/src/modules/notifications/lib/deactivate-web-push-token"
import { SETTINGS_REGISTRY, useProfile } from "@/src/modules/settings"
import { SettingsRow } from "@/src/shared/components/settings/settings-section"

type NotificationPreferences = ReturnType<typeof useProfile>["preferences"]

type NotificationChannelSettingsProps = {
  preferences: NotificationPreferences
  onPreferenceToggle: NotificationPreferenceToggle
}

export function NotificationChannelSettings({
  preferences,
  onPreferenceToggle,
}: NotificationChannelSettingsProps) {
  return (
    <>
      <SettingsRow
        label="Push"
        switchValue={preferences.notifications.channels.push}
        onSwitchChange={(checked) => {
          if (!checked) {
            void deactivatePushTokenIfPresent()
          }
          void onPreferenceToggle(
            {
              notifications: {
                channels: {
                  push: checked,
                },
              },
            },
            "Preferencia de push actualizada."
          )
        }}
        {...SETTINGS_REGISTRY.notifications.rows.push}
      />
      <SettingsRow
        label="Email"
        switchValue={preferences.notifications.channels.email}
        onSwitchChange={(checked) =>
          void onPreferenceToggle(
            {
              notifications: {
                channels: {
                  email: checked,
                },
              },
            },
            "Preferencia de email actualizada."
          )
        }
        {...SETTINGS_REGISTRY.notifications.rows.email}
      />
      <SettingsRow
        label="In-App"
        switchValue={preferences.notifications.channels.inApp}
        onSwitchChange={(checked) =>
          void onPreferenceToggle(
            {
              notifications: {
                channels: {
                  inApp: checked,
                },
              },
            },
            "Preferencia in-app actualizada."
          )
        }
        {...SETTINGS_REGISTRY.notifications.rows.inApp}
      />
    </>
  )
}
