"use client"

import { NotificationsGate } from "@/src/modules/notifications/notifications-gate"
import { DevicePushSettingsRow } from "@/src/modules/notifications/components/device-push-settings-row"
import { NotificationListSkeleton } from "@/src/modules/notifications/components/notification-list-skeleton"
import { NotificationRow } from "@/src/modules/notifications/components/notification-row"
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "@/src/modules/notifications/hooks/use-mark-notification-read"
import { useNotificationPreferences } from "@/src/modules/notifications/hooks/use-notification-preferences"
import { useNotifications } from "@/src/modules/notifications/hooks/use-notifications"
import { deactivatePushTokenIfPresent } from "@/src/modules/notifications/lib/deactivate-web-push-token"
import { groupNotificationsByDate } from "@/src/modules/notifications/lib/group-notifications-by-date"
import type { NotificationRecord } from "@/src/modules/notifications/types/notification.types"
import {
  EditQuietHoursSheet,
  SETTINGS_REGISTRY,
  useProfile,
  type ModuleSlug,
} from "@/src/modules/settings"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import {
  SettingsRow,
  SettingsSection,
} from "@/src/shared/components/layout/settings-section"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/shared/components/ui/dropdown-menu"
import { Separator } from "@/src/shared/components/ui/separator"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import {
  MODULE_SLUGS_ORDER,
  getModule,
  parseModuleSlugFromNotificationData,
} from "@/src/shared/constants/module-registry"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { appToast } from "@/src/shared/lib/app-toast"
import { formatTimeRange } from "@/src/shared/lib/date-format"
import {
  BellDot,
  BellOff,
  CheckCheckIcon,
  ListIcon,
  MoreVerticalIcon,
  SettingsIcon,
} from "lucide-react"
import { LinkPendingOverlay } from "@/src/shared/components/ui/navigation-pending"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

type NotificationReadFilter = "all" | "unread" | "read"

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

  const [prefsOpen, setPrefsOpen] = useState(false)
  const [quietHoursOpen, setQuietHoursOpen] = useState(false)
  const [readFilter, setReadFilter] = useState<NotificationReadFilter>("all")
  const [requestedModuleFilter, setRequestedModuleFilter] =
    useState<ModuleSlug | null>(null)

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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="size-9 rounded-full"
            aria-label="Opciones de notificaciones"
          >
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-56">
          <DropdownMenuGroup className="space-y-1">
            <DropdownMenuItem
              disabled={isMarkAllPending || notifications.length === 0}
              onClick={handleMarkAllRead}
            >
              <CheckCheckIcon />
              Marcar como leídas
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPrefsOpen(true)}>
              <BellDot />
              Configuración
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
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
        <NotificationPreferencesSheet
          open={prefsOpen}
          onOpenChange={setPrefsOpen}
          quietHoursOpen={quietHoursOpen}
          onQuietHoursOpenChange={setQuietHoursOpen}
          onPreferenceToggle={handlePreferenceToggle}
        />
      </div>
    )
  }

  if (notificationsQuery.isLoading) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 pb-16 md:px-6">
        <NotificationListSkeleton />
        <NotificationPreferencesSheet
          open={prefsOpen}
          onOpenChange={setPrefsOpen}
          quietHoursOpen={quietHoursOpen}
          onQuietHoursOpenChange={setQuietHoursOpen}
          onPreferenceToggle={handlePreferenceToggle}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 pb-16 md:px-6">
      <div className="flex flex-wrap gap-2">
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Filtro de notificaciones"
        >
          <Button
            role="tab"
            aria-selected={readFilter === "all"}
            variant={readFilter === "all" ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setReadFilter("all")}
          >
            <ListIcon className="size-4 shrink-0" />
            Todas
          </Button>
          <Button
            role="tab"
            aria-selected={readFilter === "unread"}
            variant={readFilter === "unread" ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setReadFilter("unread")}
          >
            <BellDot className="size-4 shrink-0" />
            {unreadCount > 0 ? `No leídas (${unreadCount})` : "No leídas"}
          </Button>
          <Button
            role="tab"
            aria-selected={readFilter === "read"}
            variant={readFilter === "read" ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setReadFilter("read")}
          >
            <CheckCheckIcon className="size-4 shrink-0" />
            {readCount > 0 ? `Leídas (${readCount})` : "Leídas"}
          </Button>
        </div>
        {moduleOptions.length > 0 ? (
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filtro por app"
          >
            {moduleOptions.map((slug) => {
              const selected = moduleFilter === slug
              const Icon = getModule(slug).icon
              return (
                <Button
                  key={slug}
                  type="button"
                  aria-pressed={selected}
                  variant={selected ? "default" : "outline"}
                  size="sm"
                  className="rounded-full"
                  onClick={() =>
                    setRequestedModuleFilter((current) =>
                      current === slug ? null : slug
                    )
                  }
                >
                  <Icon className="size-4 shrink-0" />
                  {getModule(slug).label}
                </Button>
              )
            })}
          </div>
        ) : null}
      </div>

      {sections.length === 0 ? (
        <NotificationEmptyState
          readFilter={readFilter}
          moduleLabel={moduleFilter ? getModule(moduleFilter).label : null}
        />
      ) : (
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
                      onPress={() => handleNotificationPress(item)}
                      href={notificationHref(item)}
                    />
                    {index < section.data.length - 1 ? <Separator /> : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {notificationsQuery.hasNextPage ||
      notificationsQuery.isFetchingNextPage ? (
        <div
          ref={loadMoreRef}
          className="flex h-10 items-center justify-center"
        >
          {notificationsQuery.isFetchingNextPage ? (
            <Spinner className="size-4" />
          ) : null}
        </div>
      ) : null}

      <NotificationPreferencesSheet
        open={prefsOpen}
        onOpenChange={setPrefsOpen}
        quietHoursOpen={quietHoursOpen}
        onQuietHoursOpenChange={setQuietHoursOpen}
        onPreferenceToggle={handlePreferenceToggle}
      />
    </div>
  )
}

type NotificationPreferencesSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  quietHoursOpen: boolean
  onQuietHoursOpenChange: (open: boolean) => void
  onPreferenceToggle: (
    patch: Parameters<ReturnType<typeof useProfile>["updatePreferences"]>[0],
    successMessage: string
  ) => Promise<void>
}

function NotificationEmptyState({
  readFilter,
  moduleLabel,
}: {
  readFilter: NotificationReadFilter
  moduleLabel: string | null
}) {
  const scope = moduleLabel ? ` en ${moduleLabel}` : ""
  const copy =
    readFilter === "unread"
      ? {
          title: "Todo al día",
          description: `No tienes notificaciones sin leer${scope}.`,
        }
      : readFilter === "read"
        ? {
            title: "Nada leído",
            description: `No tienes notificaciones leídas${scope}.`,
          }
        : moduleLabel
          ? {
              title: `Sin avisos de ${moduleLabel}`,
              description: `Cuando ${moduleLabel} tenga algo nuevo, aparecerá aquí.`,
            }
          : {
              title: "Sin notificaciones",
              description: "Cuando llegue algo, lo verás aquí.",
            }

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BellOff />
        </EmptyMedia>
        <EmptyTitle>{copy.title}</EmptyTitle>
        <EmptyDescription>{copy.description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

function NotificationPreferencesSheet({
  open,
  onOpenChange,
  quietHoursOpen,
  onQuietHoursOpenChange,
  onPreferenceToggle,
}: NotificationPreferencesSheetProps) {
  const { preferences } = useProfile()
  const quietHours = preferences.notifications.quietHours

  return (
    <>
      <BottomSheet
        open={open}
        onOpenChange={onOpenChange}
        title="Configuración de notificaciones"
        description="Ajusta canales y horario silencioso."
      >
        <SettingsSection title="Canales" bare>
          <SettingsRow
            label="Push"
            switchValue={preferences.notifications.channels.push}
            onSwitchChange={(checked) => {
              if (!checked) {
                void deactivatePushTokenIfPresent()
              }
              void onPreferenceToggle(
                {
                  notifications: {
                    channels: {
                      push: checked,
                    },
                  },
                },
                "Preferencia de push actualizada."
              )
            }}
            {...SETTINGS_REGISTRY.notifications.rows.push}
          />
          <SettingsRow
            label="Email"
            switchValue={preferences.notifications.channels.email}
            onSwitchChange={(checked) =>
              void onPreferenceToggle(
                {
                  notifications: {
                    channels: {
                      email: checked,
                    },
                  },
                },
                "Preferencia de email actualizada."
              )
            }
            {...SETTINGS_REGISTRY.notifications.rows.email}
          />
          <SettingsRow
            label="In-App"
            switchValue={preferences.notifications.channels.inApp}
            onSwitchChange={(checked) =>
              void onPreferenceToggle(
                {
                  notifications: {
                    channels: {
                      inApp: checked,
                    },
                  },
                },
                "Preferencia in-app actualizada."
              )
            }
            {...SETTINGS_REGISTRY.notifications.rows.inApp}
          />
          <SettingsRow
            label="Horario silencioso"
            switchValue={quietHours.enabled}
            onSwitchChange={(checked) =>
              void onPreferenceToggle(
                {
                  notifications: {
                    quietHours: { enabled: checked },
                  },
                },
                "Horario silencioso actualizado."
              )
            }
            {...SETTINGS_REGISTRY.notifications.rows.quietHoursEnabled}
          />
          {quietHours.enabled ? (
            <SettingsRow
              label="Rango horario"
              value={formatTimeRange(quietHours.start, quietHours.end)}
              onPress={() => onQuietHoursOpenChange(true)}
              {...SETTINGS_REGISTRY.notifications.rows.quietHoursSchedule}
            />
          ) : null}
          <DevicePushSettingsRow isLast />
        </SettingsSection>

        <Button variant="outline" className="w-full" asChild>
          <Link href={APP_ROUTES.app.settings} className="relative">
            <SettingsIcon className="size-4 shrink-0" />
            Ir a Ajustes completos
            <LinkPendingOverlay />
          </Link>
        </Button>
      </BottomSheet>

      <EditQuietHoursSheet
        open={quietHoursOpen}
        onOpenChange={onQuietHoursOpenChange}
      />
    </>
  )
}
