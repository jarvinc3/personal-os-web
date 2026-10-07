import type { ModuleSlug } from "../../modules/settings/types/module-config.types.ts"
import { APP_ROUTES } from "../constants/app-routes.ts"

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
