import { APP_ROUTES } from "@/src/shared/constants/app-routes"

const PROTECTED_APP_PATH_PREFIXES: readonly string[] = [
  APP_ROUTES.app.settings,
  APP_ROUTES.app.chat,
  APP_ROUTES.app.notifications,
  APP_ROUTES.app.keepAwake,
  APP_ROUTES.app.agenda,
  APP_ROUTES.app.projects,
  APP_ROUTES.app.health,
  APP_ROUTES.app.finance,
  APP_ROUTES.app.help,
  // PROVISIONAL (#272): card gallery, removed in #290.
  APP_ROUTES.app.devCardGallery,
]

/** Rutas `(app)` que exigen sesión antes de montar el layout. */
export function isProtectedAppPath(pathname: string): boolean {
  return (
    pathname === APP_ROUTES.app.home ||
    PROTECTED_APP_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  )
}

/**
 * Ruta a la que `proxy.ts` debe mandar una petición, o `null` si sigue su
 * curso. Sin sesión, `/` va a `/login`; con sesión, `/` y `/login` van a
 * `/home`; las rutas protegidas sin sesión van a `/login`.
 */
export function resolveRouteRedirect(
  pathname: string,
  hasUser: boolean
): string | null {
  if (pathname === APP_ROUTES.root) {
    return hasUser ? APP_ROUTES.app.home : APP_ROUTES.auth.login
  }

  if (pathname === APP_ROUTES.auth.login && hasUser) {
    return APP_ROUTES.app.home
  }

  if (isProtectedAppPath(pathname) && !hasUser) {
    return APP_ROUTES.auth.login
  }

  return null
}
