"use client"

import { useAuthGuard } from "@/src/modules/auth"
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
import { TransactionDetailSheet } from "@/src/modules/finance/components/transactions/transaction-detail-sheet"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/constants/sheet-keys"
import { useFinanceEnabled } from "@/src/modules/finance/hooks/use-finance-enabled"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/lib/money"
import { EditQuietHoursSheet } from "@/src/modules/settings/components/sheets/edit-quiet-hours-sheet"
import { SETTINGS_REGISTRY } from "@/src/modules/settings/constants/settings-metadata"
import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import {
  SettingsRow,
  SettingsSection,
} from "@/src/shared/components/layout/settings-section"
import { Button } from "@/src/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/shared/components/ui/dropdown-menu"
import { Separator } from "@/src/shared/components/ui/separator"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { appToast } from "@/src/shared/lib/app-toast"
import { formatTimeRange } from "@/src/shared/lib/date-format"
import { BellDot, CheckCheckIcon, MoreVerticalIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"

type NotificationFilter = "all" | "unread"

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

export function NotificationsClient() {
  const { isAuthenticated, isLoading } = useAuthGuard()
  const { isInAppEnabled } = useNotificationPreferences()
  const notificationsQuery = useNotifications()
  const markReadMutation = useMarkNotificationRead()
  const { mutateAsync: markAllAsRead, isPending: isMarkAllPending } =
    useMarkAllNotificationsRead()
  const { updatePreferences } = useProfile()
  const { isEnabled: isFinanceEnabled, config: financeConfig } =
    useFinanceEnabled()
  const router = useRouter()
  const {
    open: detailOpen,
    sheetId: detailTransactionId,
    setOpen: setDetailOpen,
  } = useSheetParam(FINANCE_SHEET_KEYS.transactionDetail)

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
  const [filter, setFilter] = useState<NotificationFilter>("all")

  const notifications = useMemo(
    () => notificationsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [notificationsQuery.data?.pages]
  )

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  )

  const visibleNotifications = useMemo(
    () =>
      filter === "unread"
        ? notifications.filter((notification) => !notification.isRead)
        : notifications,
    [filter, notifications]
  )

  const sections = useMemo(
    () => groupNotificationsByDate(visibleNotifications),
    [visibleNotifications]
  )

  const display: FinanceMoneyDisplay = {
    currency: financeConfig.baseCurrency,
    showCents: financeConfig.display.showCents,
    compactNumbers: financeConfig.display.compactNumbers,
  }

  useEffect(() => {
    if (detailOpen && !detailTransactionId) {
      setDetailOpen(false)
    }
  }, [detailOpen, detailTransactionId, setDetailOpen])

  const handleMarkAllRead = useCallback(() => {
    void markAllAsRead()
  }, [markAllAsRead])

  const handleNotificationPress = useCallback(
    (notification: NotificationRecord) => {
      if (!notification.isRead) {
        void markReadMutation.mutateAsync(notification.id)
      }
      const transactionId = readTransactionId(notification.data)
      if (transactionId) {
        setDetailOpen(true, transactionId)
      }
    },
    [markReadMutation, setDetailOpen]
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

  if (isLoading || !isAuthenticated) {
    return <LoadingView variant="screen" />
  }

  if (!isInAppEnabled) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 pb-16 md:px-6">
        <div className="flex flex-col items-center justify-center gap-4 px-6 py-16">
          <p className="text-center text-muted-foreground">
            Las notificaciones in-app están desactivadas en tus preferencias.
          </p>
          <Button variant="outline" onClick={() => setPrefsOpen(true)}>
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
      <div
        className="flex gap-2"
        role="tablist"
        aria-label="Filtro de notificaciones"
      >
        <Button
          role="tab"
          aria-selected={filter === "all"}
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => setFilter("all")}
        >
          Todas
        </Button>
        <Button
          role="tab"
          aria-selected={filter === "unread"}
          variant={filter === "unread" ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => setFilter("unread")}
        >
          {unreadCount > 0 ? `No leídas (${unreadCount})` : "No leídas"}
        </Button>
      </div>

      {sections.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          {filter === "unread"
            ? "No tienes notificaciones sin leer."
            : "No tienes notificaciones por ahora."}
        </p>
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
                    />
                    {index < section.data.length - 1 ? <Separator /> : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {notificationsQuery.hasNextPage ? (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            disabled={notificationsQuery.isFetchingNextPage}
            onClick={() => void notificationsQuery.fetchNextPage()}
          >
            {notificationsQuery.isFetchingNextPage
              ? "Cargando..."
              : "Cargar más"}
          </Button>
        </div>
      ) : null}

      <NotificationPreferencesSheet
        open={prefsOpen}
        onOpenChange={setPrefsOpen}
        quietHoursOpen={quietHoursOpen}
        onQuietHoursOpenChange={setQuietHoursOpen}
        onPreferenceToggle={handlePreferenceToggle}
      />

      <TransactionDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        transactionId={detailTransactionId}
        enabled={isFinanceEnabled}
        display={display}
        onEdit={(transaction) => {
          router.push(APP_ROUTES.app.financeTransactionEdit(transaction.id))
        }}
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
                    ...preferences.notifications,
                    channels: {
                      ...preferences.notifications.channels,
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
                    ...preferences.notifications,
                    channels: {
                      ...preferences.notifications.channels,
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
                    ...preferences.notifications,
                    channels: {
                      ...preferences.notifications.channels,
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
                    ...preferences.notifications,
                    quietHours: { ...quietHours, enabled: checked },
                  },
                },
                "Horario silencioso actualizado."
              )
            }
            {...SETTINGS_REGISTRY.notifications.rows.quietHoursEnabled}
          />
          <SettingsRow
            label="Rango horario"
            value={formatTimeRange(quietHours.start, quietHours.end)}
            onPress={() => onQuietHoursOpenChange(true)}
            disabled={!quietHours.enabled}
            {...SETTINGS_REGISTRY.notifications.rows.quietHoursSchedule}
          />
          <DevicePushSettingsRow isLast />
        </SettingsSection>

        <Button variant="outline" className="w-full" asChild>
          <Link href={APP_ROUTES.app.settings}>Ir a Ajustes completos</Link>
        </Button>
      </BottomSheet>

      <EditQuietHoursSheet
        open={quietHoursOpen}
        onOpenChange={onQuietHoursOpenChange}
      />
    </>
  )
}
