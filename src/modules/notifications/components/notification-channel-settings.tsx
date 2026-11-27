"use client"

import type { NotificationPreferenceToggle } from "@/src/modules/notifications/hooks/use-notification-preference-toggle"
import { deactivatePushTokenIfPresent } from "@/src/modules/notifications/lib/deactivate-web-push-token"
import { SETTINGS_REGISTRY, useProfile } from "@/src/modules/settings"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/src/shared/components/ui/item"
import { Switch } from "@/src/shared/components/ui/switch"

type NotificationChannels = ReturnType<
  typeof useProfile
>["preferences"]["notifications"]["channels"]

type NotificationChannelSettingsProps = {
  channels: NotificationChannels
  onPreferenceToggle: NotificationPreferenceToggle
}

const NOTIFICATIONS = SETTINGS_REGISTRY.notifications
const PushIcon = NOTIFICATIONS.rows.push.icon
const EmailIcon = NOTIFICATIONS.rows.email.icon
const InAppIcon = NOTIFICATIONS.rows.inApp.icon

const CHANNELS = [
  {
    key: "push",
    label: "Push",
    icon: PushIcon,
    preferenceKey: "push",
    successMessage: "Preferencia de push actualizada.",
  },
  {
    key: "email",
    label: "Email",
    icon: EmailIcon,
    preferenceKey: "email",
    successMessage: "Preferencia de email actualizada.",
  },
  {
    key: "inApp",
    label: "In-App",
    icon: InAppIcon,
    preferenceKey: "inApp",
    successMessage: "Preferencia in-app actualizada.",
  },
] as const

export function NotificationChannelSettings({
  channels,
  onPreferenceToggle,
}: NotificationChannelSettingsProps) {
  return (
    <>
      {CHANNELS.map(
        ({ key, label, icon: Icon, preferenceKey, successMessage }) => (
          <Item key={key} variant="plain" className="min-h-[52px] px-3 py-3">
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
            </ItemContent>
            <ItemActions>
              <Switch
                checked={channels[preferenceKey]}
                onCheckedChange={(checked) => {
                  if (preferenceKey === "push" && !checked) {
                    void deactivatePushTokenIfPresent()
                  }
                  void onPreferenceToggle(
                    {
                      notifications: {
                        channels: { [preferenceKey]: checked },
                      },
                    },
                    successMessage
                  )
                }}
              />
            </ItemActions>
          </Item>
        )
      )}
    </>
  )
}
