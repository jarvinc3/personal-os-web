import type { NotificationRecord } from "@/src/modules/notifications/types/notification.types"

/**
 * PROVISIONAL (#272): fake notifications for the card gallery. Removed with
 * this folder in #290.
 */
export const galleryUnreadNotification: NotificationRecord = {
  id: "notification-unread",
  userId: "user-ejemplo",
  type: "FINANCE_TRANSACTION_CREATED",
  channel: "IN_APP",
  title: "Nuevo movimiento",
  body: "Se registró un gasto de DOP $1,250.00 en Súper Ejemplo.",
  data: {
    categoryIcon: "\u{1F6D2}",
    categoryColor: "#16A34A",
  },
  isRead: false,
  scheduledAt: null,
  sentAt: "2026-10-22T14:30:00.000Z",
  createdAt: "2026-10-22T14:30:00.000Z",
}

export const galleryReadNotification: NotificationRecord = {
  ...galleryUnreadNotification,
  id: "notification-read",
  title: "Presupuesto cerca del tope",
  body: "El presupuesto de Súper lleva el 85% gastado este mes.",
  data: {
    categoryIcon: "\u{1F4B0}",
    categoryColor: "#16A34A",
  },
  isRead: true,
  createdAt: "2026-10-21T09:15:00.000Z",
}
