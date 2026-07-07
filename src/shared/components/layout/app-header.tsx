"use client"

import { useAuth } from "@/src/modules/auth";
import { useNotificationPreferences, useUnreadNotificationCount } from "@/src/modules/notifications";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/shared/components/ui/avatar";
import { Button } from "@/src/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/shared/components/ui/dropdown-menu";
import { Separator } from "@/src/shared/components/ui/separator";
import { SidebarTrigger } from "@/src/shared/components/ui/sidebar";
import { APP_ROUTES } from "@/src/shared/constants/app-routes";
import { useHeaderContext } from "@/src/shared/context/header-context";
import { useScrollDirection } from "@/src/shared/hooks/use-scroll-direction";
import { cn } from "@/src/shared/lib/utils";
import { useAppStore } from "@/src/shared/store/app-store";
import { BellIcon, ChevronLeftIcon, LogOutIcon, SettingsIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

const PAGE_TITLES: Record<string, string> = {
  [APP_ROUTES.app.home]: "Inicio",
  [APP_ROUTES.app.settings]: "Ajustes",
  [APP_ROUTES.app.chat]: "Agente IA",
  [APP_ROUTES.app.notifications]: "Notificaciones",
}

function resolvePageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) {
    return PAGE_TITLES[pathname]
  }
  if (pathname.startsWith(APP_ROUTES.app.settings)) {
    return "Ajustes"
  }
  if (pathname.startsWith(APP_ROUTES.app.chat)) {
    return "Agente IA"
  }
  if (pathname.startsWith(APP_ROUTES.app.notifications)) {
    return "Notificaciones"
  }
  return "Personal OS"
}

function HeaderBackButton({ onBack }: { onBack: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full size-9"
      onClick={onBack}
      aria-label="Volver"
    >
      <ChevronLeftIcon />
    </Button>
  )
}

function NotificationBell() {
  const router = useRouter();
  const { isInAppEnabled } = useNotificationPreferences();
  const unreadQuery = useUnreadNotificationCount();
  const unreadCount = isInAppEnabled ? (unreadQuery.data?.count ?? 0) : 0;

  return (
    <Button
      variant="outline"
      size="icon"
      className="relative rounded-full shrink-0 size-9 mr-1"
      onClick={() => router.push(APP_ROUTES.app.notifications)}
      aria-label="Centro de notificaciones"
    >
      <BellIcon />
      {unreadCount > 0 ? (
        <span
          className={cn(
            'flex absolute -top-1 -right-1 justify-center items-center px-1 h-4 font-medium text-white rounded-full min-w-4 bg-destructive text-[10px]',
          )}
        >
          {unreadCount > 9 ? '9+' : String(unreadCount)}
        </span>
      ) : null}
    </Button>
  );
}

function HeaderUserMenu() {
  const pathname = usePathname()
  const router = useRouter()
  const user = useAppStore((state) => state.user)
  const { logoutMutation } = useAuth()

  const displayName = user?.fullName ?? "Usuario"
  const email = user?.email ?? ""
  const avatarUrl = user?.profile?.avatarUrl ?? user?.avatarUrl

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Menú de usuario"
        >
          <Avatar className="rounded-full size-9">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="rounded-lg">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-56"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="rounded-lg size-8">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={displayName} />
                ) : null}
                <AvatarFallback className="rounded-lg">
                  {displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-sm leading-tight text-left">
                <span className="font-medium truncate">{displayName}</span>
                <span className="text-xs truncate text-muted-foreground">
                  {email}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="flex flex-col gap-2">
          <DropdownMenuItem
            onClick={() => router.push(APP_ROUTES.app.notifications)}
          >
            <BellIcon />
            Notificaciones
          </DropdownMenuItem>
          <DropdownMenuItem
            active={pathname === APP_ROUTES.app.settings}
            onClick={() => router.push(APP_ROUTES.app.settings)}
          >
            <SettingsIcon />
            Configuración
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOutIcon />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function HeaderTitle({
  title,
  subtitle,
  centered = false,
}: {
  title: ReactNode
  subtitle?: ReactNode
  centered?: boolean
}) {
  if (subtitle) {
    return (
      <div
        className={cn("flex flex-col", centered && "items-center text-center")}
      >
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        <div className="text-xl font-semibold">{title}</div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "text-lg font-bold tracking-tight md:text-xl",
        centered && "text-center"
      )}
    >
      {title}
    </div>
  )
}

function PrimaryHeader({
  title,
  actions,
  showSidebarTrigger,
  showNotificationBell,
  showUserMenu,
}: {
  title: ReactNode
  actions?: ReactNode
  showSidebarTrigger: boolean
  showNotificationBell: boolean
  showUserMenu: boolean
}) {
  return (
    <div className="flex gap-1 items-center px-4 w-full s lg:px-6">
      {showSidebarTrigger ? (
        <>
          <SidebarTrigger />
          <Separator
            orientation="vertical"
            className="mx-2 h-4 data-vertical:self-auto"
          />
        </>
      ) : null}
      <div className="flex flex-col flex-1 min-w-0">{title}</div>
      {actions ? (
        <div className="flex gap-2 items-center shrink-0 mr-1">{actions}</div>
      ) : null}
      {showNotificationBell ? <NotificationBell /> : null}
      {showUserMenu ? <HeaderUserMenu /> : null}
    </div>
  )
}

function SecondaryHeader({
  title,
  actions,
  onBack,
}: {
  title: ReactNode
  actions?: ReactNode
  onBack: () => void
}) {
  return (
    <div className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-2 px-4 lg:px-6">
      <HeaderBackButton onBack={onBack} />
      <div className="justify-self-center min-w-0">
        <HeaderTitle title={title} centered />
      </div>
      <div className="flex justify-end items-center">
        {actions ?? <span className="size-8" aria-hidden="true" />}
      </div>
    </div>
  )
}

export function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { config } = useHeaderContext()
  const { hidden } = useScrollDirection()

  const fallbackTitle = resolvePageTitle(pathname)
  const title = config.title ?? fallbackTitle
  const scrollHidden = config.scrollHide && hidden

  const handleBack = config.onBack ?? (() => router.back())

  return (
    <header
      data-header-variant={config.variant}
      className={cn(
        "sticky top-0 z-40 flex h-(--header-height) shrink-0 items-center gap-2 bg-background/80 py-2.5 backdrop-blur-lg transition-transform duration-300 ease-in-out",
        scrollHidden && "-translate-y-full"
      )}
    >
      {config.variant === "secondary" ? (
        <SecondaryHeader
          title={title}
          actions={config.actions}
          onBack={handleBack}
        />
      ) : (
        <PrimaryHeader
          title={
            config.subtitle ? (
              <HeaderTitle title={title} subtitle={config.subtitle} />
            ) : typeof title === "string" ? (
              <HeaderTitle title={title} />
            ) : (
              title
            )
          }
          actions={config.actions}
          showSidebarTrigger={config.showSidebarTrigger}
          showNotificationBell={config.showNotificationBell}
          showUserMenu={config.showUserMenu}
        />
      )}
    </header>
  )
}
