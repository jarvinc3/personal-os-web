"use client"

import { useAuth } from "@/src/modules/auth"
import { financeSectionTitle } from "@/src/modules/finance"
import {
  useNotificationPreferences,
  useUnreadNotificationCount,
} from "@/src/modules/notifications"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/shared/components/ui/avatar"
import { Button } from "@/src/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/shared/components/ui/dropdown-menu"
import { LinkPendingOverlay } from "@/src/shared/components/ui/navigation-pending"
import { Separator } from "@/src/shared/components/ui/separator"
import { SidebarTrigger } from "@/src/shared/components/ui/sidebar"
import { Spinner } from "@/src/shared/components/ui/spinner"
import {
  APP_ROUTES,
  settingsModuleHref,
} from "@/src/shared/constants/app-routes"
import { getModule } from "@/src/shared/constants/module-registry"
import { moduleSlugFromPathname } from "@/src/shared/lib/module-from-pathname"
import { useHeaderContext } from "@/src/shared/context/header-context"
import { cn } from "@/src/shared/lib/utils"
import { useAppStore } from "@/src/shared/store/app-store"
import {
  BellIcon,
  ChevronLeftIcon,
  LogOutIcon,
  SettingsIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTransition, type ReactNode } from "react"

const PAGE_TITLES: Record<string, string> = {
  [APP_ROUTES.app.home]: "Inicio",
  [APP_ROUTES.app.settings]: "Ajustes",
  [APP_ROUTES.app.chat]: "Agente IA",
  [APP_ROUTES.app.notifications]: "Notificaciones",
  [APP_ROUTES.app.keepAwake]: "Keep Awake",
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
  if (pathname.startsWith(APP_ROUTES.app.keepAwake)) {
    return "Keep Awake"
  }
  if (pathname.startsWith(APP_ROUTES.app.finance)) {
    return financeSectionTitle(pathname) ?? "Finanzas"
  }
  return "Personal OS"
}

function HeaderBackButton({
  onBack,
  pending = false,
  className,
}: {
  onBack: () => void
  pending?: boolean
  className?: string
}) {
  return (
    <Button
      variant="outline"
      size="icon"
      className={cn("size-9 rounded-full", className)}
      onClick={onBack}
      disabled={pending}
      aria-label="Volver"
    >
      {pending ? (
        <Spinner className="size-4.5" />
      ) : (
        <ChevronLeftIcon className="size-4.5" />
      )}
    </Button>
  )
}

function NotificationBell() {
  const { isInAppEnabled } = useNotificationPreferences()
  const unreadQuery = useUnreadNotificationCount()
  const unreadCount = isInAppEnabled ? (unreadQuery.data?.count ?? 0) : 0

  return (
    <Button variant="outline" size="icon" className="mr-1" asChild>
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

function HeaderUserMenu() {
  const pathname = usePathname()
  const router = useRouter()
  const user = useAppStore((state) => state.user)
  const { logoutMutation } = useAuth()

  const displayName = user?.fullName ?? "Usuario"
  const email = user?.email ?? ""
  const avatarUrl = user?.profile?.avatarUrl ?? user?.avatarUrl
  const moduleSlug = moduleSlugFromPathname(pathname)
  const moduleSettings = moduleSlug ? getModule(moduleSlug) : null

  return (
    <DropdownMenu>
      {/* Fixed id: the auto-generated one changes between server and client and breaks hydration. */}
      <DropdownMenuTrigger asChild id="user-menu-trigger">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Menú de usuario"
        >
          <Avatar className="size-9 rounded-full">
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
              <Avatar className="size-8 rounded-lg">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={displayName} />
                ) : null}
                <AvatarFallback className="rounded-lg">
                  {displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs text-muted-foreground">
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
          {moduleSettings && moduleSlug ? (
            <DropdownMenuItem
              active={pathname === settingsModuleHref(moduleSlug)}
              onClick={() => router.push(settingsModuleHref(moduleSlug))}
            >
              <SettingsIcon />
              Ajustes de {moduleSettings.label}
            </DropdownMenuItem>
          ) : null}
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

function SecondaryHeader({
  title,
  actions,
  onBack,
  pending,
  tinted,
}: {
  title: ReactNode
  actions?: ReactNode
  onBack: () => void
  pending?: boolean
  tinted?: boolean
}) {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-[auto_1fr_auto] items-center gap-2 px-4 lg:px-6",
        tinted && "text-white"
      )}
    >
      <HeaderBackButton
        onBack={onBack}
        pending={pending}
        className={
          tinted ? "text-white hover:bg-white/15 hover:text-white" : undefined
        }
      />
      <div className="min-w-0 justify-self-center">
        <HeaderTitle title={title} centered />
      </div>
      <div
        className={cn(
          "flex items-center justify-end",
          tinted &&
            "[&_button]:text-white [&_button]:hover:bg-white/15 [&_button]:hover:text-white"
        )}
      >
        {actions ?? <span className="size-8" aria-hidden="true" />}
      </div>
    </div>
  )
}

export function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { config } = useHeaderContext()
  const [isBackPending, startBackTransition] = useTransition()

  const fallbackTitle = resolvePageTitle(pathname)
  const title = config.title ?? fallbackTitle

  const handleBack = () => {
    startBackTransition(() => {
      ;(config.onBack ?? (() => router.back()))()
    })
  }

  const accentColor =
    config.variant === "secondary" ? config.accentColor : undefined

  return (
    <header
      data-header-variant={config.variant}
      className={cn(
        "sticky top-0 z-40 flex h-(--header-height) shrink-0 items-center gap-2 bg-background py-2.5",
        accentColor && "bg-transparent text-white"
      )}
      style={accentColor ? { background: accentColor } : undefined}
    >
      {config.variant === "secondary" ? (
        <SecondaryHeader
          title={title}
          actions={config.actions}
          onBack={handleBack}
          pending={isBackPending}
          tinted={Boolean(accentColor)}
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
