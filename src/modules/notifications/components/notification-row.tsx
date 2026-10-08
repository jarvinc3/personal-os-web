"use client"

import { getNotificationVisual } from "@/src/modules/notifications/lib/notification-visual"
import type { NotificationRecord } from "@/src/modules/notifications/types/notification.types"
import { formatNotificationListTime } from "@/src/shared/lib/date-format"
import { cn } from "@/src/shared/lib/utils"

type NotificationRowProps = {
  notification: NotificationRecord
  onPress: () => void
}

export function NotificationRow({
  notification,
  onPress,
}: NotificationRowProps) {
  const visual = getNotificationVisual(notification)
  const timeLabel = formatNotificationListTime(notification.createdAt)
  const Icon = visual.icon

  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        "flex w-full flex-row gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/50",
        !notification.isRead && "bg-muted/40"
      )}
    >
      <div
        className="flex size-12 shrink-0 items-center justify-center rounded-full border-2"
        style={{
          backgroundColor: `${visual.accent}1A`,
          borderColor: `${visual.accent}33`,
        }}
      >
        {visual.emoji ? (
          <span className="text-[22px] leading-none" aria-hidden>
            {visual.emoji}
          </span>
        ) : Icon ? (
          <Icon className="size-[22px]" style={{ color: visual.accent }} />
        ) : null}
      </div>

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
    </button>
  )
}
