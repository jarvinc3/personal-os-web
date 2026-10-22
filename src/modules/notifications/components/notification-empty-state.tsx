"use client"

import type { NotificationReadFilter } from "@/src/modules/notifications/types/notification.types"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { BellOff } from "lucide-react"

type NotificationEmptyStateProps = {
  readFilter: NotificationReadFilter
  moduleLabel: string | null
}

export function NotificationEmptyState({
  readFilter,
  moduleLabel,
}: NotificationEmptyStateProps) {
  const scope = moduleLabel ? ` en ${moduleLabel}` : ""
  const copy =
    readFilter === "unread"
      ? {
          title: "Todo al día",
          description: `No tienes notificaciones sin leer${scope}.`,
        }
      : readFilter === "read"
        ? {
            title: "Nada leído",
            description: `No tienes notificaciones leídas${scope}.`,
          }
        : moduleLabel
          ? {
              title: `Sin avisos de ${moduleLabel}`,
              description: `Cuando ${moduleLabel} tenga algo nuevo, aparecerá aquí.`,
            }
          : {
              title: "Sin notificaciones",
              description: "Cuando llegue algo, lo verás aquí.",
            }

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BellOff />
        </EmptyMedia>
        <EmptyTitle>{copy.title}</EmptyTitle>
        <EmptyDescription>{copy.description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
