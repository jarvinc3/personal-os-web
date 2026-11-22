import type { ModuleSlug } from "@/src/modules/settings"
import type {
  NotificationReadFilter,
  NotificationRecord,
} from "@/src/modules/notifications/types/notification.types"
import {
  MODULE_SLUGS_ORDER,
  parseModuleSlugFromNotificationData,
} from "@/src/shared/constants/module-registry"

export function notificationModuleOptions(
  notifications: readonly NotificationRecord[]
): ModuleSlug[] {
  const present = new Set<ModuleSlug>()
  for (const notification of notifications) {
    const slug = parseModuleSlugFromNotificationData(notification.data)
    if (slug) {
      present.add(slug)
    }
  }
  return MODULE_SLUGS_ORDER.filter((slug) => present.has(slug))
}

export function notificationModuleFilter(
  requestedModule: ModuleSlug | null,
  options: readonly ModuleSlug[]
): ModuleSlug | null {
  return requestedModule && options.includes(requestedModule)
    ? requestedModule
    : null
}

export function notificationsForModule(
  notifications: readonly NotificationRecord[],
  moduleFilter: ModuleSlug | null
): NotificationRecord[] {
  if (!moduleFilter) {
    return [...notifications]
  }
  return notifications.filter(
    (notification) =>
      parseModuleSlugFromNotificationData(notification.data) === moduleFilter
  )
}

export function notificationsForReadFilter(
  notifications: readonly NotificationRecord[],
  readFilter: NotificationReadFilter
): NotificationRecord[] {
  if (readFilter === "unread") {
    return notifications.filter((notification) => !notification.isRead)
  }
  if (readFilter === "read") {
    return notifications.filter((notification) => notification.isRead)
  }
  return [...notifications]
}

export function countUnreadNotifications(
  notifications: readonly NotificationRecord[]
): number {
  return notifications.filter((notification) => !notification.isRead).length
}

export function countReadNotifications(
  notifications: readonly NotificationRecord[]
): number {
  return notifications.filter((notification) => notification.isRead).length
}
