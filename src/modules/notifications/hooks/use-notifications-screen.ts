"use client"

import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "@/src/modules/notifications/hooks/use-mark-notification-read"
import { useNotificationPreferences } from "@/src/modules/notifications/hooks/use-notification-preferences"
import { useNotificationPreferenceToggle } from "@/src/modules/notifications/hooks/use-notification-preference-toggle"
import { useNotifications } from "@/src/modules/notifications/hooks/use-notifications"
import { groupNotificationsByDate } from "@/src/modules/notifications/lib/group-notifications-by-date"
import {
  countReadNotifications,
  countUnreadNotifications,
  notificationModuleFilter,
  notificationModuleOptions,
  notificationsForModule,
  notificationsForReadFilter,
} from "@/src/modules/notifications/lib/notifications-view"
import type {
  NotificationReadFilter,
  NotificationRecord,
} from "@/src/modules/notifications/types/notification.types"
import type { ModuleSlug } from "@/src/modules/settings"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { resolveInfiniteListErrorState } from "@/src/shared/lib/infinite-list-error"
import { useFormatLocale } from "@/src/modules/settings/hooks/use-format-locale"
import { useCallback, useState } from "react"

export function useNotificationsScreen() {
  const locale = useFormatLocale()
  const { isInAppEnabled } = useNotificationPreferences()
  const notificationsQuery = useNotifications()
  const markReadMutation = useMarkNotificationRead()
  const { mutateAsync: markAllAsRead, isPending: isMarkAllPending } =
    useMarkAllNotificationsRead()
  const handlePreferenceToggle = useNotificationPreferenceToggle()
  const { open: preferencesOpen, setOpen: setPreferencesOpen } = useSheetParam(
    "notification-preferences-sheet"
  )
  const { picker, openPicker, closeHandlerFor } = usePicker<
    "none" | "quiet-hours"
  >("none")
  const [readFilter, setReadFilter] = useState<NotificationReadFilter>("all")
  const [requestedModuleFilter, setRequestedModuleFilter] =
    useState<ModuleSlug | null>(null)

  const notifications =
    notificationsQuery.data?.pages.flatMap((page) => page.items) ?? []
  const notificationsErrorState = resolveInfiniteListErrorState({
    hasError: notificationsQuery.isError,
    itemCount: notifications.length,
  })
  const moduleOptions = notificationModuleOptions(notifications)
  const moduleFilter = notificationModuleFilter(
    requestedModuleFilter,
    moduleOptions
  )
  const scopedNotifications = notificationsForModule(
    notifications,
    moduleFilter
  )
  const visibleNotifications = notificationsForReadFilter(
    scopedNotifications,
    readFilter
  )
  const sections = groupNotificationsByDate(visibleNotifications, locale)

  const handleModuleFilterChange = useCallback((slug: ModuleSlug) => {
    setRequestedModuleFilter((current) => (current === slug ? null : slug))
  }, [])

  const handleMarkAllRead = useCallback(() => {
    void markAllAsRead()
  }, [markAllAsRead])

  const handleNotificationPress = useCallback(
    (notification: NotificationRecord) => {
      if (!notification.isRead) {
        void markReadMutation.mutateAsync(notification.id)
      }
    },
    [markReadMutation]
  )

  return {
    isInAppEnabled,
    notificationsQuery,
    notificationsErrorState,
    notificationsCount: notifications.length,
    sections,
    readFilter,
    setReadFilter,
    moduleOptions,
    moduleFilter,
    handleModuleFilterChange,
    unreadCount: countUnreadNotifications(scopedNotifications),
    readCount: countReadNotifications(scopedNotifications),
    handleNotificationPress,
    handleMarkAllRead,
    markAllPending: isMarkAllPending,
    preferencesOpen,
    setPreferencesOpen,
    picker,
    openPicker,
    closeHandlerFor,
    handlePreferenceToggle,
  }
}
