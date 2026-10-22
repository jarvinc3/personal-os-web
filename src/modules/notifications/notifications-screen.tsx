"use client"

import { NotificationEmptyState } from "@/src/modules/notifications/components/notification-empty-state"
import { NotificationFilters } from "@/src/modules/notifications/components/notification-filters"
import { NotificationGroupList } from "@/src/modules/notifications/components/notification-group-list"
import { NotificationHeaderMenu } from "@/src/modules/notifications/components/notification-header-menu"
import { NotificationListSkeleton } from "@/src/modules/notifications/components/notification-list-skeleton"
import { NotificationPreferencesSheet } from "@/src/modules/notifications/components/notification-preferences-sheet"
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "@/src/modules/notifications/hooks/use-mark-notification-read"
import { useNotificationPreferences } from "@/src/modules/notifications/hooks/use-notification-preferences"
import { useNotifications } from "@/src/modules/notifications/hooks/use-notifications"
import { groupNotificationsByDate } from "@/src/modules/notifications/lib/group-notifications-by-date"
import { NotificationsGate } from "@/src/modules/notifications/notifications-gate"
import type {
  NotificationReadFilter,
  NotificationRecord,
} from "@/src/modules/notifications/types/notification.types"
import { useProfile, type ModuleSlug } from "@/src/modules/settings"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import {
  MODULE_SLUGS_ORDER,
  getModule,
  parseModuleSlugFromNotificationData,
} from "@/src/shared/constants/module-registry"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { appToast } from "@/src/shared/lib/app-toast"
import { SettingsIcon } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

export function NotificationsScreen() {
  return (
    <NotificationsGate>
      <NotificationsScreenBody />
    </NotificationsGate>
  )
}

function NotificationsScreenBody() {
  const { isInAppEnabled } = useNotificationPreferences()
  const notificationsQuery = useNotifications()
  const markReadMutation = useMarkNotificationRead()
  const { mutateAsync: markAllAsRead, isPending: isMarkAllPending } =
    useMarkAllNotificationsRead()
  const { updatePreferences } = useProfile()

  const [prefsOpen, setPrefsOpen] = useState(false)
  const [quietHoursOpen, setQuietHoursOpen] = useState(false)
  const [readFilter, setReadFilter] = useState<NotificationReadFilter>("all")
  const [requestedModuleFilter, setRequestedModuleFilter] =
    useState<ModuleSlug | null>(null)

  const handlePreferenceToggle = useCallback(
    async (
      patch: Parameters<typeof updatePreferences>[0],
      successMessage: string
    ) => {
      try {
        await updatePreferences(patch)
        appToast.success({
          text1: "Guardado",
          text2: successMessage,
        })
      } catch {
        // Toast handled in useProfile mutation
      }
    },
    [updatePreferences]
  )

  const notifications = useMemo(
    () => notificationsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [notificationsQuery.data?.pages]
  )

  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const fetchNextPage = notificationsQuery.fetchNextPage
  const hasNextPage = notificationsQuery.hasNextPage
  useEffect(() => {
    const sentinel = loadMoreRef.current
    if (!sentinel || !hasNextPage) {
      return
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        void fetchNextPage()
      }
    })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage])

  const moduleOptions = useMemo(() => {
    const present = new Set<ModuleSlug>()
    for (const notification of notifications) {
      const slug = parseModuleSlugFromNotificationData(notification.data)
      if (slug) {
        present.add(slug)
      }
    }
    return MODULE_SLUGS_ORDER.filter((slug) => present.has(slug))
  }, [notifications])

  const moduleFilter =
    requestedModuleFilter && moduleOptions.includes(requestedModuleFilter)
      ? requestedModuleFilter
      : null

  const scopedNotifications = useMemo(
    () =>
      moduleFilter
        ? notifications.filter(
            (notification) =>
              parseModuleSlugFromNotificationData(notification.data) ===
              moduleFilter
          )
        : notifications,
    [moduleFilter, notifications]
  )

  const unreadCount = useMemo(
    () =>
      scopedNotifications.filter((notification) => !notification.isRead).length,
    [scopedNotifications]
  )

  const readCount = useMemo(
    () =>
      scopedNotifications.filter((notification) => notification.isRead).length,
    [scopedNotifications]
  )

  const visibleNotifications = useMemo(() => {
    if (readFilter === "unread") {
      return scopedNotifications.filter((notification) => !notification.isRead)
    }
    if (readFilter === "read") {
      return scopedNotifications.filter((notification) => notification.isRead)
    }
    return scopedNotifications
  }, [readFilter, scopedNotifications])

  const sections = useMemo(
    () => groupNotificationsByDate(visibleNotifications),
    [visibleNotifications]
  )

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

  const headerMenu = useMemo(
    () => (
      <NotificationHeaderMenu
        markAllPending={isMarkAllPending}
        canMarkAll={notifications.length > 0}
        onMarkAllRead={handleMarkAllRead}
        onOpenPreferences={() => setPrefsOpen(true)}
      />
    ),
    [handleMarkAllRead, isMarkAllPending, notifications.length]
  )

  usePageHeader(
    {
      variant: "secondary",
      title: "Notificaciones",
      actions: headerMenu,
    },
    [headerMenu]
  )

  const preferencesSheet = (
    <NotificationPreferencesSheet
      open={prefsOpen}
      quietHoursOpen={quietHoursOpen}
      onOpenChange={setPrefsOpen}
      onQuietHoursOpenChange={setQuietHoursOpen}
      onPreferenceToggle={handlePreferenceToggle}
    />
  )

  if (!isInAppEnabled) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 pb-16 md:px-6">
        <div className="flex flex-col items-center justify-center gap-4 px-6 py-16">
          <p className="text-center text-muted-foreground">
            Las notificaciones in-app están desactivadas en tus preferencias.
          </p>
          <Button variant="outline" onClick={() => setPrefsOpen(true)}>
            <SettingsIcon className="size-4 shrink-0" />
            Configurar notificaciones
          </Button>
        </div>
        {preferencesSheet}
      </div>
    )
  }

  if (notificationsQuery.isLoading) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 pb-16 md:px-6">
        <NotificationListSkeleton />
        {preferencesSheet}
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 pb-16 md:px-6">
      <NotificationFilters
        readFilter={readFilter}
        unreadCount={unreadCount}
        readCount={readCount}
        moduleOptions={moduleOptions}
        moduleFilter={moduleFilter}
        onReadFilterChange={setReadFilter}
        onModuleFilterChange={(slug) =>
          setRequestedModuleFilter((current) =>
            current === slug ? null : slug
          )
        }
      />

      {sections.length === 0 ? (
        <NotificationEmptyState
          readFilter={readFilter}
          moduleLabel={moduleFilter ? getModule(moduleFilter).label : null}
        />
      ) : (
        <NotificationGroupList
          sections={sections}
          onPress={handleNotificationPress}
        />
      )}

      {hasNextPage || notificationsQuery.isFetchingNextPage ? (
        <div
          ref={loadMoreRef}
          className="flex h-10 items-center justify-center"
        >
          {notificationsQuery.isFetchingNextPage ? (
            <Spinner className="size-4" />
          ) : null}
        </div>
      ) : null}

      {preferencesSheet}
    </div>
  )
}
