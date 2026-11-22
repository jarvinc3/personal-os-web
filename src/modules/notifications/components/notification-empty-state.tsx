"use client"

import { resolveNotificationEmptyCopy } from "@/src/modules/notifications/lib/notification-empty-copy"
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
  const copy = resolveNotificationEmptyCopy({ readFilter, moduleLabel })

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
