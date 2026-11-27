"use client"

import { DevicePushSettingsRow } from "@/src/modules/notifications/components/device-push-settings-row"
import { NotificationChannelSettings } from "@/src/modules/notifications/components/notification-channel-settings"
import { NotificationQuietHoursSettings } from "@/src/modules/notifications/components/notification-quiet-hours-settings"
import type { NotificationPreferenceToggle } from "@/src/modules/notifications/hooks/use-notification-preference-toggle"
import { EditQuietHoursSheet, useProfile } from "@/src/modules/settings"
import { SheetBody } from "@/src/shared/components/sheets/sheet-body"
import { SheetHeader } from "@/src/shared/components/sheets/sheet-header"
import { SHEET_FOOTER_CLASS } from "@/src/shared/components/sheets/sheet-layout"
import { LinkPendingOverlay } from "@/src/shared/components/shell/navigation-pending"
import { Button, buttonVariants } from "@/src/shared/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/src/shared/components/ui/drawer"
import { ItemGroup } from "@/src/shared/components/ui/item"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { cn } from "@/src/shared/lib/utils"
import { SettingsIcon, XIcon } from "lucide-react"
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
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <SheetHeader
            title="Configuración de notificaciones"
            description="Ajusta canales y horario silencioso."
          />
          <SheetBody>
            <section className="flex flex-col gap-2">
              <h2 className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Canales
              </h2>
              <ItemGroup className="gap-0 divide-y divide-border/60">
                <NotificationChannelSettings
                  channels={preferences.notifications.channels}
                  onPreferenceToggle={onPreferenceToggle}
                />
                <NotificationQuietHoursSettings
                  quietHours={preferences.notifications.quietHours}
                  onPreferenceToggle={onPreferenceToggle}
                  onQuietHoursOpenChange={onQuietHoursOpenChange}
                />
                <DevicePushSettingsRow />
              </ItemGroup>
            </section>

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
          </SheetBody>
          <DrawerFooter className={SHEET_FOOTER_CLASS}>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              <XIcon className="size-4 shrink-0" aria-hidden="true" />
              Cancelar
            </Button>
          </DrawerFooter>
        </DrawerContent>
        <EditQuietHoursSheet
          open={quietHoursOpen}
          onOpenChange={onQuietHoursOpenChange}
        />
      </Drawer>
    </>
  )
}
