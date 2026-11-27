"use client"

import type { NotificationPreferenceToggle } from "@/src/modules/notifications/hooks/use-notification-preference-toggle"
import { useFormatLocale } from "@/src/modules/settings/hooks/use-format-locale"
import { SETTINGS_REGISTRY, type useProfile } from "@/src/modules/settings"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/src/shared/components/ui/item"
import { Switch } from "@/src/shared/components/ui/switch"
import { formatTimeRange } from "@/src/shared/lib/date-format"
import { ChevronRightIcon } from "lucide-react"

type QuietHours = ReturnType<
  typeof useProfile
>["preferences"]["notifications"]["quietHours"]

type NotificationQuietHoursSettingsProps = {
  quietHours: QuietHours
  onPreferenceToggle: NotificationPreferenceToggle
  onQuietHoursOpenChange: (open: boolean) => void
}

const NOTIFICATIONS = SETTINGS_REGISTRY.notifications
const QuietHoursIcon = NOTIFICATIONS.rows.quietHoursEnabled.icon
const QuietHoursScheduleIcon = NOTIFICATIONS.rows.quietHoursSchedule.icon

export function NotificationQuietHoursSettings({
  quietHours,
  onPreferenceToggle,
  onQuietHoursOpenChange,
}: NotificationQuietHoursSettingsProps) {
  const locale = useFormatLocale()

  return (
    <>
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
        </ItemContent>
        <ItemActions>
          <Switch
            checked={quietHours.enabled}
            onCheckedChange={(checked) =>
              void onPreferenceToggle(
                {
                  notifications: {
                    quietHours: { enabled: checked },
                  },
                },
                "Horario silencioso actualizado."
              )
            }
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
              onClick={() => onQuietHoursOpenChange(true)}
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
    </>
  )
}
