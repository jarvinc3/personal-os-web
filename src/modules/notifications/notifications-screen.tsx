"use client"

import { NotificationEmptyState } from "@/src/modules/notifications/components/notification-empty-state"
import { NotificationFilters } from "@/src/modules/notifications/components/notification-filters"
import { NotificationGroupList } from "@/src/modules/notifications/components/notification-group-list"
import { NotificationHeaderMenu } from "@/src/modules/notifications/components/notification-header-menu"
import { NotificationLoadMore } from "@/src/modules/notifications/components/notification-load-more"
import { NotificationPreferencesSheet } from "@/src/modules/notifications/components/notification-preferences-sheet"
import { NotificationsBlockedState } from "@/src/modules/notifications/components/notifications-blocked-state"
import { useNotificationsScreen } from "@/src/modules/notifications/hooks/use-notifications-screen"
import { resolveNotificationsScreenState } from "@/src/modules/notifications/lib/notifications-screen-state"
import { NotificationsGate } from "@/src/modules/notifications/notifications-gate"
import { getModule } from "@/src/shared/constants/module-registry"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"

export function NotificationsScreen() {
  return (
    <NotificationsGate>
      <NotificationsScreenBody />
    </NotificationsGate>
  )
}

function NotificationsScreenBody() {
  const {
    isInAppEnabled,
    notificationsQuery,
    notificationsErrorState,
    notificationsCount,
    sections,
    readFilter,
    setReadFilter,
    moduleOptions,
    moduleFilter,
    handleModuleFilterChange,
    unreadCount,
    readCount,
    handleNotificationPress,
    handleMarkAllRead,
    markAllPending,
    preferencesOpen,
    setPreferencesOpen,
    picker,
    openPicker,
    closeHandlerFor,
    handlePreferenceToggle,
  } = useNotificationsScreen()

  usePageHeader(
    {
      variant: "secondary",
      title: "Notificaciones",
      actions: (
        <NotificationHeaderMenu
          markAllPending={markAllPending}
          canMarkAll={notificationsCount > 0}
          onMarkAllRead={handleMarkAllRead}
          onOpenPreferences={() => setPreferencesOpen(true)}
        />
      ),
    },
    [handleMarkAllRead, markAllPending, notificationsCount, setPreferencesOpen]
  )

  const preferencesSheet = (
    <NotificationPreferencesSheet
      open={preferencesOpen}
      quietHoursOpen={picker === "quiet-hours"}
      onOpenChange={setPreferencesOpen}
      onQuietHoursOpenChange={(next) => {
        if (next) {
          openPicker("quiet-hours")
          return
        }
        closeHandlerFor("quiet-hours")(false)
      }}
      onPreferenceToggle={handlePreferenceToggle}
    />
  )

  const screenState = resolveNotificationsScreenState({
    isInAppEnabled,
    isLoading: notificationsQuery.isLoading,
    errorState: notificationsErrorState,
  })

  if (screenState !== "ready") {
    return (
      <NotificationsBlockedState
        state={screenState}
        preferencesSheet={preferencesSheet}
        onOpenPreferences={() => setPreferencesOpen(true)}
        onRetry={() => void notificationsQuery.refetch()}
        isRetrying={notificationsQuery.isFetching}
      />
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
        onModuleFilterChange={handleModuleFilterChange}
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

      <NotificationLoadMore
        hasNextPage={notificationsQuery.hasNextPage}
        isFetchingNextPage={notificationsQuery.isFetchingNextPage}
        hasError={Boolean(notificationsQuery.error)}
        onLoadMore={() => void notificationsQuery.fetchNextPage()}
      />

      {preferencesSheet}
    </div>
  )
}
