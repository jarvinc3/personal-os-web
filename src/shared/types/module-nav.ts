import type { LucideIcon } from "lucide-react"

export type ModuleSlug =
  "finance" | "agenda" | "projects" | "subscriptions" | "health"

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
