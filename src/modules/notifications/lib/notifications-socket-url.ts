import { API_BASE_URL } from "@/src/shared/constants/api-endpoints"

/** Base del canal en vivo: el mismo anfitrión del API, sin el prefijo `/api`. */
export function resolveNotificationsSocketUrl(
  apiBaseUrl: string = API_BASE_URL
): string {
  return apiBaseUrl.replace(/\/api\/?$/, "")
}
