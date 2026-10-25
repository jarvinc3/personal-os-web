"use client"

import {
  useNotificationPreferences,
  useUnreadNotificationCount,
} from "@/src/modules/notifications"
import { LinkPendingOverlay } from "@/src/shared/components/shell/navigation-pending"
import { Button } from "@/src/shared/components/ui/button"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { cn } from "@/src/shared/lib/utils"
import { BellIcon } from "lucide-react"
import Link from "next/link"

export function NotificationBell() {
  const { isInAppEnabled } = useNotificationPreferences()
  const unreadQuery = useUnreadNotificationCount()
  const unreadCount = isInAppEnabled ? (unreadQuery.data?.count ?? 0) : 0

  return (
    <Button variant="outline" size="icon" className="mr-1 rounded-full" asChild>
      <Link
        href={APP_ROUTES.app.notifications}
        className="relative size-9 shrink-0 rounded-full"
        aria-label="Centro de notificaciones"
      >
        <BellIcon />
        {unreadCount > 0 ? (
          <span
            className={cn(
              "absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-white"
            )}
          >
            {unreadCount > 9 ? "9+" : String(unreadCount)}
          </span>
        ) : null}
        <LinkPendingOverlay />
      </Link>
    </Button>
  )
}
