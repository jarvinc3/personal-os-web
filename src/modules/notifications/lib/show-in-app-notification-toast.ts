import { getNotificationVisual } from "@/src/modules/notifications/lib/notification-visual"
import type { NotificationSocketPayload } from "@/src/modules/notifications/types/notification.types"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { appToast } from "@/src/shared/lib/app-toast"

function toNotificationRecord(payload: NotificationSocketPayload) {
  return {
    id: payload.id,
    userId: "",
    type: payload.type,
    channel: "IN_APP" as const,
    title: payload.title,
    body: payload.body,
    data: payload.data ?? {},
    isRead: false,
    scheduledAt: null,
    sentAt: null,
    createdAt: payload.createdAt,
  }
}

export function showInAppNotificationToast(payload: NotificationSocketPayload) {
  const visual = getNotificationVisual(toNotificationRecord(payload))

  appToast.info({
    text1: payload.title,
    text2: payload.body,
    duration: 5000,
    accent: visual.accent,
    action: {
      label: "Ver",
      onClick: () => {
        window.location.href = APP_ROUTES.app.notifications
      },
    },
  })
}
