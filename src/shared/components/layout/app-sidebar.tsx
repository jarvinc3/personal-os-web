"use client"

import { useAuth } from "@/src/modules/auth"
import { FINANCE_APP_NAV } from "@/src/modules/finance"
import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import {
  Collapsible,
  CollapsibleContent,
} from "@/src/shared/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/src/shared/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/src/shared/components/ui/sidebar"
import { LinkPendingOverlay } from "@/src/shared/components/ui/navigation-pending"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { enabledAppEntries } from "@/src/shared/lib/enabled-app-nav"
import { isModuleSectionActive } from "@/src/shared/lib/module-nav-active"
import { cn } from "@/src/shared/lib/utils"
import type { ModuleNavItem, ModuleSlug } from "@/src/shared/types/module-nav"
import {
  BellIcon,
  ChevronRight,
  Home,
  LogOutIcon,
  type LucideIcon,
  Monitor,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { AppLogo } from "@/src/shared/components/brand/app-logo"
import { Badge } from "@/src/shared/components/ui/badge"
import { Separator } from "@/src/shared/components/ui/separator"

const navItems = {
  main: [
    {
      title: "Inicio",
      url: APP_ROUTES.app.home,
      icon: Home,
    },
    {
      title: "Ajustes",
      url: APP_ROUTES.app.settings,
      icon: Settings,
    },
  ],
  notifications: [
    {
      title: "Notificaciones",
      url: APP_ROUTES.app.notifications,
      icon: BellIcon,
    },
  ],
}

/** Sections shown inside an app; only Finanzas declares them today. */
const APP_SECTIONS: Partial<Record<ModuleSlug, ModuleNavItem[]>> = {
  finance: FINANCE_APP_NAV.items,
}

export function AppSidebar() {
  const { logoutMutation } = useAuth()
  const { userModules } = useProfile()

  const enabledSlugs = userModules
    .filter((module) => module.isEnabled)
    .map((module) => module.slug)
  const applications = [
    ...enabledAppEntries(enabledSlugs).map((entry) => ({
      title: entry.label,
      url: entry.href,
      icon: entry.icon,
      items: APP_SECTIONS[entry.slug],
    })),
    {
      title: "Keep Awake",
      url: APP_ROUTES.app.keepAwake,
      icon: Monitor,
    },
  ]

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href={APP_ROUTES.app.home} className="relative">
                <AppLogo size="xs" className="rounded" />
                <span className="text-base font-semibold">Personal OS</span>
                <Badge
                  variant="info"
                  className="ml-auto group-data-[collapsible=icon]:hidden"
                >
                  Beta
                </Badge>
                <LinkPendingOverlay />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain groupLabel="Menú principal" items={navItems.main} />

        <NavMain groupLabel="Aplicaciones" items={applications} />
      </SidebarContent>

      <SidebarFooter>
        <Separator />

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => logoutMutation.mutate()}
              variant="destructive"
              size="md"
            >
              <LogOutIcon className="text-destructive" size={16} />
              Cerrar sesión
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

type NavMainItem = {
  title: string
  url: string
  icon?: LucideIcon
  items?: ModuleNavItem[]
}

function NavMain({
  groupLabel,
  items,
}: {
  groupLabel: string
  items: NavMainItem[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const sections = item.items ?? []
            const hasSections = sections.length >= 1
            const isUnderRoot =
              pathname === item.url || pathname.startsWith(`${item.url}/`)

            if (!hasSections) {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton isActive={isUnderRoot} size="md" asChild>
                    <Link href={item.url} className="relative">
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <LinkPendingOverlay />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            }

            return (
              <NavMainCollapsibleItem
                key={`${item.title}-${isUnderRoot}`}
                item={item}
                pathname={pathname}
                isUnderRoot={isUnderRoot}
              />
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function NavMainCollapsibleItem({
  item,
  pathname,
  isUnderRoot,
}: {
  item: NavMainItem
  pathname: string
  isUnderRoot: boolean
}) {
  const [isOpen, setIsOpen] = useState(isUnderRoot)
  const sections = item.items ?? []
  const { isMobile, state } = useSidebar()
  const showSectionsMenu = !isMobile && state === "collapsed"

  if (showSectionsMenu) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild id={`nav-menu-${item.url.slice(1)}`}>
            <SidebarMenuButton
              isActive={isUnderRoot}
              closeSidebarOnClick={false}
              size="md"
              aria-label={item.title}
            >
              {item.icon && <item.icon />}
              <span>{item.title}</span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="right"
            align="start"
            sideOffset={8}
            className="min-w-48"
          >
            <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
            {sections.map((section) => (
              <DropdownMenuItem
                key={section.href}
                asChild
                active={isModuleSectionActive(section, pathname)}
              >
                <Link href={section.href} className="relative">
                  {section.icon && <section.icon />}
                  <span>{section.label}</span>
                  <LinkPendingOverlay />
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarMenuItem>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <SidebarMenuButton
          isActive={isUnderRoot}
          closeSidebarOnClick={false}
          size="md"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          {item.icon && <item.icon />}
          <span>{item.title}</span>
          <ChevronRight
            className={cn(
              "ml-auto size-4 transition-transform group-data-[collapsible=icon]:hidden",
              isOpen && "rotate-90"
            )}
          />
        </SidebarMenuButton>
        {/* Fixed id: the auto-generated one changes between server and client and breaks hydration. */}
        <CollapsibleContent id={`nav-panel-${item.url.slice(1)}`}>
          <SidebarMenuSub>
            {sections.map((section) => (
              <SidebarMenuSubItem key={section.href}>
                <SidebarMenuSubButton
                  asChild
                  isActive={isModuleSectionActive(section, pathname)}
                >
                  <Link href={section.href} className="relative">
                    {section.icon && <section.icon />}
                    <span>{section.label}</span>
                    <LinkPendingOverlay />
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  )
}
