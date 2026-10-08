import { apiPost } from "@/src/config/api-client"
import {
  serializePushSubscription,
  urlBase64ToUint8Array,
} from "@/src/modules/notifications/lib/push-subscription"
import { registerServiceWorker } from "@/src/modules/notifications/lib/register-service-worker"
import {
  getNotificationPermission,
  isPushServiceUnavailableError,
  isWebPushSupported,
} from "@/src/modules/notifications/lib/web-push-support"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"

type RegisterWebPushTokenPayload = {
  platform: "web"
  token: string
}

export type RegisterWebPushTokenResult =
  | { ok: true; token: string }
  | {
      ok: false
      reason:
        | "unsupported"
        | "permission-denied"
        | "vapid-not-configured"
        | "service-worker-unavailable"
        | "push-service-unavailable"
        | "unknown"
    }

export async function registerWebPushTokenWithApi(): Promise<RegisterWebPushTokenResult> {
  if (!isWebPushSupported()) {
    return { ok: false, reason: "unsupported" }
  }

  if (getNotificationPermission() !== "granted") {
    return { ok: false, reason: "permission-denied" }
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim()
  if (!vapidPublicKey) {
    return { ok: false, reason: "vapid-not-configured" }
  }

  const registration = await registerServiceWorker()
  if (!registration) {
    return { ok: false, reason: "service-worker-unavailable" }
  }

  try {
    let subscription = await registration.pushManager.getSubscription()
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          vapidPublicKey
        ) as BufferSource,
      })
    }

    const token = serializePushSubscription(subscription)

    await apiPost(
      API_ENDPOINTS.NOTIFICATIONS.PUSH_TOKENS,
      {
        platform: "web",
        token,
      } satisfies RegisterWebPushTokenPayload,
      { suppressUnauthorizedEvent: true }
    )

    return { ok: true, token }
  } catch (error) {
    if (isPushServiceUnavailableError(error)) {
      return { ok: false, reason: "push-service-unavailable" }
    }

    return { ok: false, reason: "unknown" }
  }
}
