import type { NotificationReadFilter } from "@/src/modules/notifications/types/notification.types"

export type NotificationEmptyCopy = {
  title: string
  description: string
}

type NotificationEmptyCopyInput = {
  readFilter: NotificationReadFilter
  moduleLabel: string | null
}

export function resolveNotificationEmptyCopy({
  readFilter,
  moduleLabel,
}: NotificationEmptyCopyInput): NotificationEmptyCopy {
  const scope = moduleLabel ? ` en ${moduleLabel}` : ""

  if (readFilter === "unread") {
    return {
      title: "Todo al día",
      description: `No tienes notificaciones sin leer${scope}.`,
    }
  }
  if (readFilter === "read") {
    return {
      title: "Nada leído",
      description: `No tienes notificaciones leídas${scope}.`,
    }
  }
  if (moduleLabel) {
    return {
      title: `Sin avisos de ${moduleLabel}`,
      description: `Cuando ${moduleLabel} tenga algo nuevo, aparecerá aquí.`,
    }
  }
  return {
    title: "Sin notificaciones",
    description: "Cuando llegue algo, lo verás aquí.",
  }
}
