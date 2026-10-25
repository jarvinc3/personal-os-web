import { HeaderUserMenu } from "@/src/shared/components/shell/header/header-user-menu"
import { NotificationBell } from "@/src/shared/components/shell/header/notification-bell"
import { Separator } from "@/src/shared/components/ui/separator"
import { SidebarTrigger } from "@/src/shared/components/ui/sidebar"
import { useSidebarEdgeSwipe } from "@/src/shared/hooks/use-sidebar-edge-swipe"
import type { ReactNode } from "react"

type PrimaryHeaderProps = {
  title: ReactNode
  actions?: ReactNode
  showSidebarTrigger: boolean
  showNotificationBell: boolean
  showUserMenu: boolean
}

export function PrimaryHeader({
  title,
  actions,
  showSidebarTrigger,
  showNotificationBell,
  showUserMenu,
}: PrimaryHeaderProps) {
  useSidebarEdgeSwipe(showSidebarTrigger)

  return (
    <div className="s flex w-full items-center gap-1 px-4 lg:px-6">
      {showSidebarTrigger ? (
        <>
          <SidebarTrigger />
          <Separator
            orientation="vertical"
            className="mx-2 h-4 data-vertical:self-auto"
          />
        </>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">{title}</div>
      {actions ? (
        <div className="mr-1 flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
      {showNotificationBell ? <NotificationBell /> : null}
      {showUserMenu ? <HeaderUserMenu /> : null}
    </div>
  )
}
