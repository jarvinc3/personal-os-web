import { getNotificationVisual } from "@/src/modules/notifications/lib/notification-visual"
import type { NotificationSocketPayload } from "@/src/modules/notifications/types/notification.types"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { toast } from "sonner"

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

  toast.info(payload.title, {
    description: payload.body,
    duration: 5000,
    action: {
      label: "Ver",
      onClick: () => {
        window.location.href = APP_ROUTES.app.notifications
      },
    },
    style: {
      borderLeft: `3px solid ${visual.accent}`,
    },
  })
}
