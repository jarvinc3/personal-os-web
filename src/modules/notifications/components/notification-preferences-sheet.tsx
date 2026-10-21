"use client"

import { DevicePushSettingsRow } from "@/src/modules/notifications/components/device-push-settings-row"
import { deactivatePushTokenIfPresent } from "@/src/modules/notifications/lib/deactivate-web-push-token"
import {
  EditQuietHoursSheet,
  SETTINGS_REGISTRY,
  useProfile,
} from "@/src/modules/settings"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import {
  SettingsRow,
  SettingsSection,
} from "@/src/shared/components/layout/settings-section"
import { Button } from "@/src/shared/components/ui/button"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { formatTimeRange } from "@/src/shared/lib/date-format"
import { LinkPendingOverlay } from "@/src/shared/components/ui/navigation-pending"
import { SettingsIcon } from "lucide-react"
import Link from "next/link"

type NotificationPreferenceToggle = (
  patch: Parameters<ReturnType<typeof useProfile>["updatePreferences"]>[0],
  successMessage: string
) => Promise<void>

type NotificationPreferencesSheetProps = {
  open: boolean
  quietHoursOpen: boolean
  onOpenChange: (open: boolean) => void
  onQuietHoursOpenChange: (open: boolean) => void
  onPreferenceToggle: NotificationPreferenceToggle
}

export function NotificationPreferencesSheet({
  open,
  quietHoursOpen,
  onOpenChange,
  onQuietHoursOpenChange,
  onPreferenceToggle,
}: NotificationPreferencesSheetProps) {
  const { preferences } = useProfile()
  const quietHours = preferences.notifications.quietHours

  return (
    <>
      <BottomSheet
        open={open}
        onOpenChange={onOpenChange}
        title="Configuración de notificaciones"
        description="Ajusta canales y horario silencioso."
      >
        <SettingsSection title="Canales" bare>
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
              value={formatTimeRange(quietHours.start, quietHours.end)}
              onPress={() => onQuietHoursOpenChange(true)}
              {...SETTINGS_REGISTRY.notifications.rows.quietHoursSchedule}
            />
          ) : null}
          <DevicePushSettingsRow isLast />
        </SettingsSection>

        <Button variant="outline" className="w-full" asChild>
          <Link href={APP_ROUTES.app.settings} className="relative">
            <SettingsIcon className="size-4 shrink-0" />
            Ir a Ajustes completos
            <LinkPendingOverlay />
          </Link>
        </Button>
      </BottomSheet>

      <EditQuietHoursSheet
        open={quietHoursOpen}
        onOpenChange={onQuietHoursOpenChange}
      />
    </>
  )
}
