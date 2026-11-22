import type { InfiniteListErrorState } from "@/src/shared/lib/infinite-list-error"

export type NotificationsScreenState =
  "disabled" | "loading" | "error" | "ready"

type NotificationsScreenStateInput = {
  isInAppEnabled: boolean
  isLoading: boolean
  errorState: InfiniteListErrorState
}

/** Las preferencias apagadas mandan sobre la carga; sin filas, el fallo ocupa la pantalla. */
export function resolveNotificationsScreenState({
  isInAppEnabled,
  isLoading,
  errorState,
}: NotificationsScreenStateInput): NotificationsScreenState {
  if (!isInAppEnabled) {
    return "disabled"
  }
  if (isLoading) {
    return "loading"
  }
  if (errorState === "full") {
    return "error"
  }
  return "ready"
}
