import { financeSectionTitle } from "@/src/modules/finance"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"

const PAGE_TITLES: Record<string, string> = {
  [APP_ROUTES.app.home]: "Inicio",
  [APP_ROUTES.app.settings]: "Ajustes",
  [APP_ROUTES.app.notifications]: "Notificaciones",
  [APP_ROUTES.app.keepAwake]: "Keep Awake",
  [APP_ROUTES.app.intelligence]: "Inteligencia",
}

/** Título de la cabecera cuando la página no declara uno propio. */
export function resolvePageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) {
    return PAGE_TITLES[pathname]
  }
  if (pathname.startsWith(APP_ROUTES.app.settings)) {
    return "Ajustes"
  }
  if (pathname.startsWith(APP_ROUTES.app.notifications)) {
    return "Notificaciones"
  }
  if (pathname.startsWith(APP_ROUTES.app.keepAwake)) {
    return "Keep Awake"
  }
  if (pathname.startsWith(APP_ROUTES.app.intelligence)) {
    return "Inteligencia"
  }
  if (pathname.startsWith(APP_ROUTES.app.finance)) {
    return financeSectionTitle(pathname) ?? "Finanzas"
  }
  return "Personal OS"
}
