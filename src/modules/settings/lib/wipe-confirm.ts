export type ReauthConfirmMode = "pending" | "password" | "google" | "unavailable"

export function resolveReauthConfirmMode(state: {
  isLoadingProviders: boolean
  canConfirmInApp: boolean | null
  isGoogleOnly: boolean
}): ReauthConfirmMode {
  if (state.isLoadingProviders || state.canConfirmInApp === null) {
    return "pending"
  }
  if (state.isGoogleOnly) {
    return "google"
  }
  if (state.canConfirmInApp) {
    return "password"
  }
  return "unavailable"
}
