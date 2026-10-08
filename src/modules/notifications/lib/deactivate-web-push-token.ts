import { apiPatch } from "@/src/config/api-client"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useAppStore } from "@/src/shared/store/app-store"

export async function deactivatePushTokenIfPresent(): Promise<void> {
  const pushToken = useAppStore.getState().pushToken
  if (!pushToken) {
    return
  }

  await apiPatch(
    API_ENDPOINTS.NOTIFICATIONS.DEACTIVATE_PUSH_TOKEN(
      encodeURIComponent(pushToken)
    ),
    undefined,
    { suppressUnauthorizedEvent: true }
  ).catch(() => undefined)

  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker
      .getRegistration("/")
      .catch(() => undefined)
    const subscription = await registration?.pushManager.getSubscription()
    await subscription?.unsubscribe().catch(() => undefined)
  }

  useAppStore.getState().setPushToken(null)
}
