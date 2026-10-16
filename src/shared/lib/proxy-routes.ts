import { APP_ROUTES } from "@/src/shared/constants/app-routes"

/** Rutas `(app)` que exigen sesión antes de montar el layout. */
export function isProtectedAppPath(pathname: string): boolean {
  return (
    pathname === APP_ROUTES.app.home ||
    pathname.startsWith(APP_ROUTES.app.settings) ||
    pathname.startsWith(APP_ROUTES.app.chat) ||
    pathname.startsWith(APP_ROUTES.app.notifications) ||
    pathname.startsWith(APP_ROUTES.app.keepAwake) ||
    pathname.startsWith(APP_ROUTES.app.finance)
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
