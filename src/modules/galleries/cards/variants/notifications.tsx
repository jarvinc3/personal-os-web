import { NotificationRow } from "@/src/modules/notifications/components/notification-row"
import {
  galleryReadNotification,
  galleryUnreadNotification,
} from "@/src/modules/galleries/cards/mock/notifications"
import type { GalleryVariant } from "@/src/modules/galleries/cards/variants/types"

/** Fila de notificación existente, leída y no leída (#272). */
export const notificationVariants: readonly GalleryVariant[] = [
  {
    id: "notificacion-no-leida",
    label: "No leída",
    propLabel: "isRead = false",
    height: "≈ 88 px",
    render: ({ notifyTap }) => (
      <div className="overflow-hidden rounded-2xl border border-border">
        <NotificationRow
          notification={galleryUnreadNotification}
          onPress={notifyTap}
        />
      </div>
    ),
  },
  {
    id: "notificacion-leida",
    label: "Leída",
    propLabel: "isRead = true",
    height: "≈ 88 px",
    render: ({ notifyTap }) => (
      <div className="overflow-hidden rounded-2xl border border-border">
        <NotificationRow
          notification={galleryReadNotification}
          onPress={notifyTap}
        />
      </div>
    ),
  },
]
