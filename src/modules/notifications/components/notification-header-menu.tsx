"use client"

import { Button } from "@/src/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/shared/components/ui/dropdown-menu"
import { BellDot, CheckCheckIcon, MoreVerticalIcon } from "lucide-react"

type NotificationHeaderMenuProps = {
  markAllPending: boolean
  canMarkAll: boolean
  onMarkAllRead: () => void
  onOpenPreferences: () => void
}

export function NotificationHeaderMenu({
  markAllPending,
  canMarkAll,
  onMarkAllRead,
  onOpenPreferences,
}: NotificationHeaderMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="size-9 rounded-full"
          aria-label="Opciones de notificaciones"
        >
          <MoreVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuGroup className="space-y-1">
          <DropdownMenuItem
            disabled={markAllPending || !canMarkAll}
            onClick={onMarkAllRead}
          >
            <CheckCheckIcon />
            Marcar como leídas
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onOpenPreferences}>
            <BellDot />
            Configuración
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
