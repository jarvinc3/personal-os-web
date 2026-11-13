"use client"

import {
  useNotificationPreferences,
  useUnreadNotificationCount,
} from "@/src/modules/notifications"
import { LinkPendingOverlay } from "@/src/shared/components/shell/navigation-pending"
import { Badge } from "@/src/shared/components/ui/badge"
import { buttonVariants } from "@/src/shared/components/ui/button"
import { cn } from "@/src/shared/lib/utils"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { BellIcon } from "lucide-react"
import Link from "next/link"

export function NotificationBell() {
  const { isInAppEnabled } = useNotificationPreferences()
  const unreadQuery = useUnreadNotificationCount()
  const unreadCount = isInAppEnabled ? (unreadQuery.data?.count ?? 0) : 0

  return (
    <Link
      href={APP_ROUTES.app.notifications}
      aria-label="Centro de notificaciones"
      className={cn(
        buttonVariants({
          variant: "outline",
          size: "icon",
          className: "relative mr-1 size-9 shrink-0 rounded-full",
        })
      )}
    >
      <BellIcon />
      {unreadCount > 0 ? (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-4 min-w-4 border-transparent bg-destructive px-1 text-[10px] text-white tabular-nums"
        >
          {unreadCount > 9 ? "9+" : String(unreadCount)}
        </Badge>
      ) : null}
      <LinkPendingOverlay />
    </Link>
  )
}
