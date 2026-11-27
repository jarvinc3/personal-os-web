"use client"

import type { ReactNode } from "react"

import type { NotificationsScreenState } from "@/src/modules/notifications/lib/notifications-screen-state"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { Button } from "@/src/shared/components/ui/button"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import { ERROR_MESSAGES } from "@/src/shared/lib/error-messages"
import { SettingsIcon } from "lucide-react"

const LOADING_SECTIONS = 2
const LOADING_ROWS = 3

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
      {state === "loading" ? (
        <div className="flex flex-col gap-4" aria-hidden>
          {Array.from({ length: LOADING_SECTIONS }, (_, sectionIndex) => (
            <div key={sectionIndex} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <div className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-border p-4">
                {Array.from({ length: LOADING_ROWS }, (_, rowIndex) => (
                  <div key={rowIndex} className="flex items-center gap-3">
                    <Skeleton className="size-12 shrink-0 rounded-full" />
                    <div className="flex flex-1 flex-col gap-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-3 w-10" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
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
