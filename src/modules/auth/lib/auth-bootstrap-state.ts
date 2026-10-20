import { APP_ROUTES } from "@/src/shared/constants/app-routes"

/**
 * `/login` is only reached when the proxy found no claims, so hydrating a
 * stored session there would block the form on `/users/me`.
 */
export function shouldHydrateStoredSession(pathname: string): boolean {
  return pathname !== APP_ROUTES.auth.login
}
