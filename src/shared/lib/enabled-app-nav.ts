import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import {
  MODULE_SLUGS_ORDER,
  getModule,
} from "@/src/shared/constants/module-registry"
import type { ModuleSlug } from "@/src/shared/types/module-nav"
import type { LucideIcon } from "lucide-react"

type AppModuleSlug = Exclude<ModuleSlug, "keepAwake">

const APP_ROOT_HREF: Record<AppModuleSlug, string> = {
  finance: APP_ROUTES.app.finance,
  agenda: APP_ROUTES.app.agenda,
  projects: APP_ROUTES.app.projects,
  health: APP_ROUTES.app.health,
}

export type AppNavEntry = {
  slug: AppModuleSlug
  label: string
  href: string
  icon: LucideIcon
}

function isAppModuleSlug(slug: ModuleSlug): slug is AppModuleSlug {
  return slug !== "keepAwake"
}

/**
 * Apps the sidebar offers: only the ones the user turned on, in registry order.
 * Keep Awake is not an app, so it never comes from the user's modules.
 */
export function enabledAppEntries(
  enabledSlugs: readonly ModuleSlug[]
): AppNavEntry[] {
  const enabled = new Set(enabledSlugs)
  const entries: AppNavEntry[] = []

  for (const slug of MODULE_SLUGS_ORDER) {
    if (!enabled.has(slug) || !isAppModuleSlug(slug)) {
      continue
    }
    const moduleDef = getModule(slug)
    entries.push({
      slug,
      label: moduleDef.label,
      href: APP_ROOT_HREF[slug],
      icon: moduleDef.icon,
    })
  }

  return entries
}
