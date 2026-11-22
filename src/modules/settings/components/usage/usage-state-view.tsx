"use client"

import { UsageEmpty } from "@/src/modules/settings/components/usage/usage-empty"
import { UsageSkeleton } from "@/src/modules/settings/components/usage/usage-skeleton"
import { ErrorState } from "@/src/shared/components/feedback/error-state"

const USAGE_LOAD_ERROR_MESSAGE = "No se pudo cargar el uso de clasificación."

type UsageStateViewProps =
  | { state: "loading" }
  | { state: "empty" }
  | { state: "error"; onRetry: () => void; isRetrying?: boolean }

export function UsageStateView(props: UsageStateViewProps) {
  if (props.state === "loading") {
    return <UsageSkeleton />
  }

  if (props.state === "error") {
    return (
      <ErrorState
        message={USAGE_LOAD_ERROR_MESSAGE}
        onRetry={props.onRetry}
        isRetrying={props.isRetrying ?? false}
      />
    )
  }

  return <UsageEmpty />
}
