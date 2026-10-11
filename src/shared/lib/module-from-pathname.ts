import type { ModuleSlug } from "@/src/modules/settings"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"

export function moduleSlugFromPathname(pathname: string): ModuleSlug | null {
  if (
    pathname === APP_ROUTES.app.settings ||
    pathname.startsWith(`${APP_ROUTES.app.settings}/`)
  ) {
    return null
  }

  if (
    pathname === APP_ROUTES.app.finance ||
    pathname.startsWith(`${APP_ROUTES.app.finance}/`)
  ) {
    return "finance"
  }

  return null
}
