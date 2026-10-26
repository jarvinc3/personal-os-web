import type { NotificationRecord } from "@/src/modules/notifications/types/notification.types"
import {
  formatNotificationDateSectionLabel,
  getNotificationDateSectionKey,
  type NotificationDateSectionKey,
} from "@/src/shared/lib/date-format"

export type NotificationListSection = {
  key: NotificationDateSectionKey
  title: string
  data: NotificationRecord[]
}

const SECTION_ORDER: Record<string, number> = {
  today: 0,
  yesterday: 1,
}

function sectionSortIndex(key: NotificationDateSectionKey): number {
  if (key in SECTION_ORDER) {
    return SECTION_ORDER[key]
  }
  return 2
}

export function groupNotificationsByDate(
  items: NotificationRecord[],
  locale: string
): NotificationListSection[] {
  const buckets = new Map<NotificationDateSectionKey, NotificationRecord[]>()

  for (const item of items) {
    const key = getNotificationDateSectionKey(item.createdAt)
    const list = buckets.get(key) ?? []
    list.push(item)
    buckets.set(key, list)
  }

  return [...buckets.entries()]
    .sort(([keyA], [keyB]) => {
      const orderDiff = sectionSortIndex(keyA) - sectionSortIndex(keyB)
      if (orderDiff !== 0) {
        return orderDiff
      }
      return keyB.localeCompare(keyA)
    })
    .map(([key, data]) => ({
      key,
      title: formatNotificationDateSectionLabel({
        sectionKey: key,
        locale,
        referenceIso: data[0]?.createdAt,
      }),
      data: data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    }))
}
