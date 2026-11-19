"use client"

import { getNotificationVisual } from "@/src/modules/notifications/lib/notification-visual"
import type { NotificationRecord } from "@/src/modules/notifications/types/notification.types"
import {
  PendingSurface,
  usePendingNavigation,
} from "@/src/shared/components/shell/navigation-pending"
import { IconBadge } from "@/src/shared/components/data-display/icon-badge"
import { formatNotificationListTime } from "@/src/shared/lib/date-format"
import { cn } from "@/src/shared/lib/utils"
import { useFormatLocale } from "@/src/modules/settings/hooks/use-format-locale"

type NotificationRowProps = {
  notification: NotificationRecord
  onPress: () => void
  href?: string
}

export function NotificationRow({
  notification,
  onPress,
  href,
}: NotificationRowProps) {
  const { navigate, isPending } = usePendingNavigation()
  const locale = useFormatLocale()
  const visual = getNotificationVisual(notification)
  const timeLabel = formatNotificationListTime(notification.createdAt, locale)
  const Icon = visual.icon

  const handlePress = () => {
    onPress()
    if (href) {
      navigate(href)
    }
  }

  return (
    <button
      type="button"
      onClick={handlePress}
      disabled={isPending}
      aria-busy={isPending || undefined}
      className={cn(
        "relative flex w-full flex-row gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/50",
        !notification.isRead && "bg-muted/40"
      )}
    >
      <IconBadge icon={Icon ?? undefined} color={visual.accent}>
        {visual.emoji ? (
          <span className="text-[22px] leading-none" aria-hidden>
            {visual.emoji}
          </span>
        ) : undefined}
      </IconBadge>

      <div className="flex min-w-0 flex-1 flex-col gap-1 pr-1">
        <p
          className={cn(
            "truncate text-base text-foreground",
            !notification.isRead && "font-semibold"
          )}
        >
          {notification.title}
        </p>
        <p className="line-clamp-2 text-sm leading-5 text-muted-foreground">
          {notification.body}
        </p>
      </div>

      <div className="flex min-w-[72px] flex-col items-end gap-2">
        <span className="text-xs text-muted-foreground">{timeLabel}</span>
        {!notification.isRead ? (
          <span className="size-2.5 rounded-full bg-primary" />
        ) : (
          <span className="size-2.5" />
        )}
      </div>
      {isPending ? <PendingSurface /> : null}
    </button>
  )
}
