"use client"

import type { NotificationListSection } from "@/src/modules/notifications/lib/group-notifications-by-date"
import { NotificationRow } from "@/src/modules/notifications/components/notification-row"
import type { NotificationRecord } from "@/src/modules/notifications/types/notification.types"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { Separator } from "@/src/shared/components/ui/separator"

function readTransactionId(
  notificationData: Record<string, unknown>
): string | null {
  const value = notificationData.transactionId
  if (typeof value !== "string") {
    return null
  }
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function notificationHref(
  notification: NotificationRecord
): string | undefined {
  const transactionId = readTransactionId(notification.data)
  return transactionId
    ? APP_ROUTES.app.financeTransaction(transactionId)
    : undefined
}

type NotificationGroupListProps = {
  sections: NotificationListSection[]
  onPress: (notification: NotificationRecord) => void
}

export function NotificationGroupList({
  sections,
  onPress,
}: NotificationGroupListProps) {
  return (
    <div className="flex flex-col gap-4">
      {sections.map((section) => (
        <div key={section.key} className="flex flex-col">
          <p className="px-1 pt-2 pb-2 text-sm font-medium text-muted-foreground">
            {section.title}
          </p>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {section.data.map((item, index) => (
              <div key={item.id}>
                <NotificationRow
                  notification={item}
                  onPress={() => onPress(item)}
                  href={notificationHref(item)}
                />
                {index < section.data.length - 1 ? <Separator /> : null}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
