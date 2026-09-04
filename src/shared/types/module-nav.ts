import type { LucideIcon } from "lucide-react"
import type { ModuleSlug } from "@/src/modules/settings/types/module-config.types"

export type ModuleNavItem = {
  label: string
  href: string
  icon: LucideIcon
  matchExact?: boolean
  extraActiveHrefs?: readonly string[]
}

export type ModuleAppNav = {
  slug?: ModuleSlug
  rootHref: string
  label: string
  icon: LucideIcon
  items: ModuleNavItem[]
}
