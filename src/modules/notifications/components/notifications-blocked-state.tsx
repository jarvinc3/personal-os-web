"use client"

import type { ReactNode } from "react"

import { NotificationListSkeleton } from "@/src/modules/notifications/components/notification-list-skeleton"
import type { NotificationsScreenState } from "@/src/modules/notifications/lib/notifications-screen-state"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { Button } from "@/src/shared/components/ui/button"
import { ERROR_MESSAGES } from "@/src/shared/lib/error-messages"
import { SettingsIcon } from "lucide-react"

type NotificationsBlockedStateProps = {
  state: Exclude<NotificationsScreenState, "ready">
  preferencesSheet: ReactNode
  onOpenPreferences: () => void
  onRetry: () => void
  isRetrying: boolean
}

export function NotificationsBlockedState({
  state,
  preferencesSheet,
  onOpenPreferences,
  onRetry,
  isRetrying,
}: NotificationsBlockedStateProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 pb-16 md:px-6">
      {state === "disabled" ? (
        <div className="flex flex-col items-center justify-center gap-4 px-6 py-16">
          <p className="text-center text-muted-foreground">
            Las notificaciones in-app están desactivadas en tus preferencias.
          </p>
          <Button variant="outline" onClick={onOpenPreferences}>
            <SettingsIcon className="size-4 shrink-0" />
            Configurar notificaciones
          </Button>
        </div>
      ) : null}
      {state === "loading" ? <NotificationListSkeleton /> : null}
      {state === "error" ? (
        <ErrorState
          message={ERROR_MESSAGES.loadHint}
          onRetry={onRetry}
          isRetrying={isRetrying}
        />
      ) : null}
      {preferencesSheet}
    </div>
  )
}
