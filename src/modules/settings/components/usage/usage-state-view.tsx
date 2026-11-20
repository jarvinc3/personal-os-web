"use client"

import { UsageEmpty } from "@/src/modules/settings/components/usage/usage-empty"
import { UsageSkeleton } from "@/src/modules/settings/components/usage/usage-skeleton"
import { ErrorState } from "@/src/shared/components/feedback/error-state"

export const USAGE_LOAD_ERROR_MESSAGE =
  "No se pudo cargar el uso de clasificación."

export type UsageState = "loading" | "error" | "empty"

type UsageStateViewProps = {
  state: UsageState
  onRetry?: () => void
  isRetrying?: boolean
}

export function UsageStateView({
  state,
  onRetry,
  isRetrying = false,
}: UsageStateViewProps) {
  if (state === "loading") {
    return <UsageSkeleton />
  }

  if (state === "error") {
    return (
      <ErrorState
        message={USAGE_LOAD_ERROR_MESSAGE}
        onRetry={onRetry}
        isRetrying={isRetrying}
      />
    )
  }

  return <UsageEmpty />
}
