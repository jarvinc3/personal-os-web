import type { ModuleSlug } from "@/src/modules/settings/types/module-config.types";
import type { LucideIcon } from "lucide-react";

export type ModuleNavItem = {
  label: string
  href: string
  icon: LucideIcon
  matchExact?: boolean
  extraActiveHrefs?: readonly string[]
  showInTabBar?: boolean
}

export type ModuleAppNav = {
  slug?: ModuleSlug
  rootHref: string
  label: string
  icon: LucideIcon
  items: ModuleNavItem[]
}
