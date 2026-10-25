"use client"

import type { NotificationReadFilter } from "@/src/modules/notifications/types/notification.types"
import type { ModuleSlug } from "@/src/modules/settings"
import { SegmentedControl } from "@/src/shared/components/forms/segmented-control"
import { Button } from "@/src/shared/components/ui/button"
import { getModule } from "@/src/shared/constants/module-registry"
import { BellDot, CheckCheckIcon, ListIcon } from "lucide-react"

type NotificationFiltersProps = {
  readFilter: NotificationReadFilter
  unreadCount: number
  readCount: number
  moduleOptions: ModuleSlug[]
  moduleFilter: ModuleSlug | null
  onReadFilterChange: (filter: NotificationReadFilter) => void
  onModuleFilterChange: (slug: ModuleSlug) => void
}

export function NotificationFilters({
  readFilter,
  unreadCount,
  readCount,
  moduleOptions,
  moduleFilter,
  onReadFilterChange,
  onModuleFilterChange,
}: NotificationFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <SegmentedControl
        ariaLabel="Filtro de notificaciones"
        value={readFilter}
        onChange={onReadFilterChange}
        options={[
          { value: "all", label: "Todas", icon: ListIcon },
          {
            value: "unread",
            label: unreadCount > 0 ? `No leídas (${unreadCount})` : "No leídas",
            icon: BellDot,
          },
          {
            value: "read",
            label: readCount > 0 ? `Leídas (${readCount})` : "Leídas",
            icon: CheckCheckIcon,
          },
        ]}
      />
      {moduleOptions.length > 0 ? (
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filtro por app"
        >
          {moduleOptions.map((slug) => {
            const selected = moduleFilter === slug
            const Icon = getModule(slug).icon
            return (
              <Button
                key={slug}
                type="button"
                aria-pressed={selected}
                variant={selected ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => onModuleFilterChange(slug)}
              >
                <Icon className="size-4 shrink-0" />
                {getModule(slug).label}
              </Button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
