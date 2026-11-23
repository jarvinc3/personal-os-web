"use client"

import { DevicePushSettingsRow } from "@/src/modules/notifications/components/device-push-settings-row"
import { NotificationChannelSettings } from "@/src/modules/notifications/components/notification-channel-settings"
import { NotificationQuietHoursSettings } from "@/src/modules/notifications/components/notification-quiet-hours-settings"
import type { NotificationPreferenceToggle } from "@/src/modules/notifications/hooks/use-notification-preference-toggle"
import { EditQuietHoursSheet, useProfile } from "@/src/modules/settings"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { SettingsSection } from "@/src/shared/components/settings/settings-section"
import { LinkPendingOverlay } from "@/src/shared/components/shell/navigation-pending"
import { buttonVariants } from "@/src/shared/components/ui/button"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { cn } from "@/src/shared/lib/utils"
import { SettingsIcon } from "lucide-react"
import Link from "next/link"

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

  return (
    <>
      <BottomSheet
        open={open}
        onOpenChange={onOpenChange}
        title="Configuración de notificaciones"
        description="Ajusta canales y horario silencioso."
      >
        <SettingsSection title="Canales" bare>
          <NotificationChannelSettings
            preferences={preferences}
            onPreferenceToggle={onPreferenceToggle}
          />
          <NotificationQuietHoursSettings
            quietHours={preferences.notifications.quietHours}
            onPreferenceToggle={onPreferenceToggle}
            onQuietHoursOpenChange={onQuietHoursOpenChange}
          />
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
