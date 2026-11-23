"use client"

import type { NotificationPreferenceToggle } from "@/src/modules/notifications/hooks/use-notification-preference-toggle"
import { useFormatLocale } from "@/src/modules/settings/hooks/use-format-locale"
import { SETTINGS_REGISTRY, type useProfile } from "@/src/modules/settings"
import { SettingsRow } from "@/src/shared/components/settings/settings-section"
import { formatTimeRange } from "@/src/shared/lib/date-format"

type QuietHours = ReturnType<
  typeof useProfile
>["preferences"]["notifications"]["quietHours"]

type NotificationQuietHoursSettingsProps = {
  quietHours: QuietHours
  onPreferenceToggle: NotificationPreferenceToggle
  onQuietHoursOpenChange: (open: boolean) => void
}

export function NotificationQuietHoursSettings({
  quietHours,
  onPreferenceToggle,
  onQuietHoursOpenChange,
}: NotificationQuietHoursSettingsProps) {
  const locale = useFormatLocale()

  return (
    <>
      <SettingsRow
        label="Horario silencioso"
        switchValue={quietHours.enabled}
        onSwitchChange={(checked) =>
          void onPreferenceToggle(
            {
              notifications: {
                quietHours: { enabled: checked },
              },
            },
            "Horario silencioso actualizado."
          )
        }
        {...SETTINGS_REGISTRY.notifications.rows.quietHoursEnabled}
      />
      {quietHours.enabled ? (
        <SettingsRow
          label="Rango horario"
          value={formatTimeRange({
            start: quietHours.start,
            end: quietHours.end,
            locale,
          })}
          onPress={() => onQuietHoursOpenChange(true)}
          {...SETTINGS_REGISTRY.notifications.rows.quietHoursSchedule}
        />
      ) : null}
    </>
  )
}
