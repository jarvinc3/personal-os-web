"use client"

import {
  deactivatePushTokenIfPresent,
  DevicePushSettingsRow,
} from "@/src/modules/notifications"
import { SettingsSecondaryPage } from "@/src/modules/settings/components/layout/settings-secondary-page"
import { EditQuietHoursSheet } from "@/src/modules/settings/components/sheets/edit-quiet-hours-sheet"
import { SETTINGS_REGISTRY } from "@/src/modules/settings/constants/settings-metadata"
import { SETTINGS_SHEET_KEYS } from "@/src/modules/settings/constants/sheet-keys"
import { usePreferenceToggle } from "@/src/modules/settings/hooks/use-preference-toggle"
import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import {
  channelPreferenceChange,
  quietHoursPreferenceChange,
} from "@/src/modules/settings/lib/notification-preference"
import { SettingsGate } from "@/src/modules/settings/settings-gate"
import { formatTimeRange } from "@/src/shared/lib/date-format"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { useFormatLocale } from "@/src/modules/settings/hooks/use-format-locale"
import { Card } from "@/src/shared/components/ui/card"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/src/shared/components/ui/item"
import { Switch } from "@/src/shared/components/ui/switch"
import { ChevronRightIcon } from "lucide-react"

const NOTIFICATIONS = SETTINGS_REGISTRY.notifications
const PushIcon = NOTIFICATIONS.rows.push.icon
const EmailIcon = NOTIFICATIONS.rows.email.icon
const InAppIcon = NOTIFICATIONS.rows.inApp.icon
const QuietHoursIcon = NOTIFICATIONS.rows.quietHoursEnabled.icon
const QuietHoursScheduleIcon = NOTIFICATIONS.rows.quietHoursSchedule.icon

export function NotificationsSettingsScreen() {
  return (
    <SettingsGate>
      <NotificationsSettingsScreenBody />
    </SettingsGate>
  )
}

function NotificationsSettingsScreenBody() {
  const locale = useFormatLocale()
  const { preferences } = useProfile()
  const togglePreference = usePreferenceToggle()
  const { open: openQuietHoursSheet, setOpen: setOpenQuietHoursSheet } =
    useSheetParam(SETTINGS_SHEET_KEYS.quietHours)
  const quietHours = preferences.notifications.quietHours
  const channels = preferences.notifications.channels

  const channelRows = [
    {
      key: "push",
      label: "Push",
      description: "Avisos en el teléfono.",
      icon: PushIcon,
      enabled: channels.push,
      onChange: (checked: boolean) => {
        if (!checked) {
          void deactivatePushTokenIfPresent()
        }
        const change = channelPreferenceChange("push", checked)
        togglePreference(change.patch, change.successMessage)
      },
    },
    {
      key: "email",
      label: "Email",
      description: "Resumen y avisos por correo.",
      icon: EmailIcon,
      enabled: channels.email,
      onChange: (checked: boolean) => {
        const change = channelPreferenceChange("email", checked)
        togglePreference(change.patch, change.successMessage)
      },
    },
    {
      key: "inApp",
      label: "In-App",
      description: "Avisos dentro de la app.",
      icon: InAppIcon,
      enabled: channels.inApp,
      onChange: (checked: boolean) => {
        const change = channelPreferenceChange("inApp", checked)
        togglePreference(change.patch, change.successMessage)
      },
    },
  ]

  return (
    <SettingsSecondaryPage title="Notificaciones">
      <section className="flex flex-col gap-2">
        <h2 className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Canales
        </h2>
        <Card className="gap-0 bg-card p-1">
          <ItemGroup className="gap-0 divide-y divide-border/60">
            {channelRows.map(
              ({ key, label, description, icon: Icon, enabled, onChange }) => (
                <Item
                  key={key}
                  variant="plain"
                  className="min-h-[52px] px-3 py-3"
                >
                  <ItemMedia
                    className="size-9 rounded-md"
                    style={{ backgroundColor: `${NOTIFICATIONS.accent}20` }}
                  >
                    <Icon
                      className="size-4.5"
                      style={{ color: NOTIFICATIONS.accent }}
                    />
                  </ItemMedia>
                  <ItemContent className="gap-0.5">
                    <ItemTitle className="text-sm font-normal md:text-base">
                      {label}
                    </ItemTitle>
                    <ItemDescription className="text-xs">
                      {description}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Switch checked={enabled} onCheckedChange={onChange} />
                  </ItemActions>
                </Item>
              )
            )}
          </ItemGroup>
        </Card>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Horario silencioso
        </h2>
        <Card className="gap-0 bg-card p-1">
          <ItemGroup className="gap-0 divide-y divide-border/60">
            <Item variant="plain" className="min-h-[52px] px-3 py-3">
              <ItemMedia
                className="size-9 rounded-md"
                style={{ backgroundColor: `${NOTIFICATIONS.accent}20` }}
              >
                <QuietHoursIcon
                  className="size-4.5"
                  style={{ color: NOTIFICATIONS.accent }}
                />
              </ItemMedia>
              <ItemContent className="gap-0.5">
                <ItemTitle className="text-sm font-normal md:text-base">
                  Horario silencioso
                </ItemTitle>
                <ItemDescription className="text-xs">
                  Pausa los avisos en el rango elegido.
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Switch
                  checked={quietHours.enabled}
                  onCheckedChange={(checked) => {
                    const change = quietHoursPreferenceChange(checked)
                    togglePreference(change.patch, change.successMessage)
                  }}
                />
              </ItemActions>
            </Item>
            {quietHours.enabled ? (
              <Item
                variant="plain"
                className="min-h-[52px] px-3 py-3"
                render={
                  <button
                    type="button"
                    onClick={() => setOpenQuietHoursSheet(true)}
                  />
                }
              >
                <ItemMedia
                  className="size-9 rounded-md"
                  style={{ backgroundColor: `${NOTIFICATIONS.accent}20` }}
                >
                  <QuietHoursScheduleIcon
                    className="size-4.5"
                    style={{ color: NOTIFICATIONS.accent }}
                  />
                </ItemMedia>
                <ItemContent className="gap-0.5">
                  <div className="flex flex-col gap-0.5 md:flex-row md:items-center md:justify-between md:gap-3">
                    <ItemTitle className="text-sm font-normal md:text-base">
                      Rango horario
                    </ItemTitle>
                    <ItemDescription className="max-w-[90%] truncate text-xs md:text-right">
                      {formatTimeRange({
                        start: quietHours.start,
                        end: quietHours.end,
                        locale,
                      })}
                    </ItemDescription>
                  </div>
                </ItemContent>
                <ItemActions>
                  <ChevronRightIcon className="size-4.5 text-muted-foreground" />
                </ItemActions>
              </Item>
            ) : null}
          </ItemGroup>
        </Card>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Este dispositivo
        </h2>
        <Card className="gap-0 bg-card p-1">
          <ItemGroup className="gap-0">
            <DevicePushSettingsRow accentColor={NOTIFICATIONS.accent} />
          </ItemGroup>
        </Card>
      </section>

      <EditQuietHoursSheet
        open={openQuietHoursSheet}
        onOpenChange={setOpenQuietHoursSheet}
      />
    </SettingsSecondaryPage>
  )
}
