"use client"

import { DevicePushSettingsRow } from "@/src/modules/notifications/components/device-push-settings-row"
import { deactivatePushTokenIfPresent } from "@/src/modules/notifications/lib/deactivate-web-push-token"
import {
  EditQuietHoursSheet,
  SETTINGS_REGISTRY,
  useProfile,
} from "@/src/modules/settings"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import {
  SettingsRow,
  SettingsSection,
} from "@/src/shared/components/settings/settings-section"
import { buttonVariants } from "@/src/shared/components/ui/button"
import { cn } from "@/src/shared/lib/utils"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { formatTimeRange } from "@/src/shared/lib/date-format"
import { LinkPendingOverlay } from "@/src/shared/components/shell/navigation-pending"
import { SettingsIcon } from "lucide-react"
import Link from "next/link"
import { useFormatLocale } from "@/src/modules/settings/hooks/use-format-locale"

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
  const locale = useFormatLocale()
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
              value={formatTimeRange({
                start: quietHours.start,
                end: quietHours.end,
                locale,
              })}
              onPress={() => onQuietHoursOpenChange(true)}
              {...SETTINGS_REGISTRY.notifications.rows.quietHoursSchedule}
            />
          ) : null}
          <DevicePushSettingsRow isLast />
        </SettingsSection>

        <Link
          href={APP_ROUTES.app.settings}
          className={cn(
            buttonVariants({
              variant: "outline",
              className: "relative w-full",
            })
          )}
        >
          <SettingsIcon className="size-4 shrink-0" />
          Ir a Ajustes completos
          <LinkPendingOverlay />
        </Link>
      </BottomSheet>

      <EditQuietHoursSheet
        open={quietHoursOpen}
        onOpenChange={onQuietHoursOpenChange}
      />
    </>
  )
}
