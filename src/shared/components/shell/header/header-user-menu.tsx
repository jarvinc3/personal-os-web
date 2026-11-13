"use client"

import { useAuth } from "@/src/modules/auth"
import { LinkPendingOverlay } from "@/src/shared/components/shell/navigation-pending"
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
import {
  APP_ROUTES,
  settingsModuleHref,
} from "@/src/shared/constants/app-routes"
import { getModule } from "@/src/shared/constants/module-registry"
import { moduleSlugFromPathname } from "@/src/shared/lib/module-from-pathname"
import { useAppStore } from "@/src/shared/store/app-store"
import { BellIcon, LogOutIcon, SettingsIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function HeaderUserMenu() {
  const pathname = usePathname()
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
      <DropdownMenuTrigger
        id="user-menu-trigger"
        render={
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Menú de usuario"
          />
        }
      >
        <Avatar className="size-9 rounded-full">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="rounded-lg">
            {displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
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
            render={
              <Link href={APP_ROUTES.app.notifications} className="relative" />
            }
          >
            <BellIcon />
            Notificaciones
            <LinkPendingOverlay />
          </DropdownMenuItem>
          {moduleSettings && moduleSlug ? (
            <DropdownMenuItem
              render={
                <Link
                  href={settingsModuleHref(moduleSlug)}
                  className="relative"
                />
              }
              className={
                pathname === settingsModuleHref(moduleSlug)
                  ? "bg-accent text-accent-foreground"
                  : undefined
              }
            >
              <SettingsIcon />
              Ajustes de {moduleSettings.label}
              <LinkPendingOverlay />
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            render={
              <Link href={APP_ROUTES.app.settings} className="relative" />
            }
            className={
              pathname === APP_ROUTES.app.settings
                ? "bg-accent text-accent-foreground"
                : undefined
            }
          >
            <SettingsIcon />
            Configuración
            <LinkPendingOverlay />
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
