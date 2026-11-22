import { APP_ROUTES } from "@/src/shared/constants/app-routes"

/**
 * Una ruta propia empieza por una sola barra. Con `//` el navegador lee un
 * anfitrión, y con `\` lo mismo, porque convierte la barra invertida en barra.
 */
function isOwnPath(value: string | null): value is string {
  if (!value) {
    return false
  }
  return (
    value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")
  )
}

/**
 * Ruta propia a la que vuelve el navegador después de canjear el código de
 * sesión. `next` llega por la URL, así que solo se acepta una ruta del mismo
 * origen: con `@otro-dominio`, `//otro-dominio` o una URL absoluta se vuelve al
 * inicio en vez de salir de la app.
 */
export function resolveCallbackRedirectTarget({
  next,
  origin,
}: {
  next: string | null
  origin: string
}): string {
  const fallback = APP_ROUTES.app.home

  if (!isOwnPath(next)) {
    return fallback
  }

  const target = new URL(next, origin)
  if (target.origin !== origin) {
    return fallback
  }

  // `..` puede dejar la ruta normalizada empezando por `//`.
  const path = `${target.pathname}${target.search}${target.hash}`
  return isOwnPath(path) ? path : fallback
}
