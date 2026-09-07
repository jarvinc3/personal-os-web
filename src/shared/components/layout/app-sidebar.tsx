"use client"

import { useAuth } from "@/src/modules/auth";
import { FINANCE_APP_NAV } from "@/src/modules/finance/constants/nav";
import {
  Collapsible,
  CollapsibleContent,
} from "@/src/shared/components/ui/collapsible";
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
} from "@/src/shared/components/ui/sidebar";
import { APP_ROUTES } from "@/src/shared/constants/app-routes";
import { isModuleSectionActive } from "@/src/shared/lib/module-nav-active";
import { cn } from "@/src/shared/lib/utils";
import type { ModuleNavItem } from "@/src/shared/types/module-nav";
import {
  BellIcon,
  ChevronRight,
  Home,
  LogOutIcon,
  type LucideIcon,
  Monitor,
  Settings,
  SparklesIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AppLogo } from "../brand/app-logo";
import { Separator } from "../ui/separator";

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
  applications: [
    {
      title: FINANCE_APP_NAV.label,
      url: FINANCE_APP_NAV.rootHref,
      icon: FINANCE_APP_NAV.icon,
      items: FINANCE_APP_NAV.items,
    },
    {
      title: "Keep Awake",
      url: APP_ROUTES.app.keepAwake,
      icon: Monitor,
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

export function AppSidebar() {
  const router = useRouter()
  const { logoutMutation } = useAuth()

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => router.push(APP_ROUTES.app.home)}>
              <AppLogo size="xs" className="rounded" />
              <span className="text-base font-semibold">Personal OS</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain groupLabel="Menú principal" items={navItems.main} />

        <NavMain groupLabel="Aplicaciones" items={navItems.applications} />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="md"
              onClick={() => router.push(APP_ROUTES.app.chat)}
            >
              <SparklesIcon className="text-destructive" size={16} />
              Agente IA
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

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
  const router = useRouter()

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
                  <SidebarMenuButton
                    isActive={isUnderRoot}
                    onClick={() => router.push(item.url)}
                    size="md"
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
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
        <CollapsibleContent>
          <SidebarMenuSub>
            {sections.map((section) => (
              <SidebarMenuSubItem key={section.href}>
                <SidebarMenuSubButton
                  asChild
                  isActive={isModuleSectionActive(section, pathname)}
                >
                  <Link href={section.href}>
                    {section.icon && <section.icon />}
                    <span>{section.label}</span>
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
