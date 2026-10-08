export function isWebPushSupported(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  )
}

export function isPushServiceUnavailableError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false
  }

  const name = "name" in error ? String(error.name) : ""
  const message = "message" in error ? String(error.message).toLowerCase() : ""

  return name === "AbortError" || message.includes("push service not available")
}

export function getNotificationPermission():
  NotificationPermission | "unsupported" {
  if (!isWebPushSupported()) {
    return "unsupported"
  }

  return Notification.permission
}
