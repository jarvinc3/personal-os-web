import { ApiError } from "@/src/config/api-client.utils"

const API_BADGE_STYLE =
  "display:inline-block;background:#0f766e;color:#fff;border:1px solid #115e59;border-radius:4px;padding:1px 5px;font-weight:700"
const ERROR_BADGE_STYLE =
  "display:inline-block;background:#7f1d1d;color:#fff;border:1px solid #991b1b;border-radius:4px;padding:1px 5px;font-weight:700"
const DETAIL_STYLE = "color:#94a3b8;font-family:monospace"

export function logApiRequest(path: string, requestId: string) {
  if (process.env.NODE_ENV !== "development") {
    return
  }

  if (typeof window === "undefined") {
    console.debug(`[API] ${path} requestId=${requestId}`)
    return
  }

  console.debug(
    "%c API %c %s %c requestId=%s",
    API_BADGE_STYLE,
    "color:#0f766e;font-weight:600",
    path,
    DETAIL_STYLE,
    requestId
  )
}

function logWarning(title: string, details: string) {
  if (typeof window === "undefined") {
    console.warn(`[API] ${title}: ${details}`)
    return
  }

  console.groupCollapsed(
    `%c API %c ${title}`,
    API_BADGE_STYLE,
    ERROR_BADGE_STYLE
  )
  console.warn(details)
  console.groupEnd()
}

export function logApiError(error: unknown, context?: string) {
  if (process.env.NODE_ENV !== "development") {
    return
  }

  if (error instanceof ApiError) {
    const requestIdPart = error.requestId ? ` requestId=${error.requestId}` : ""
    const title = `${error.status} ${context ?? error.path ?? "API"}`
    logWarning(
      title,
      `${error.code ?? "ERROR"} path=${error.path ?? "unknown"}${requestIdPart}: ${error.message}`
    )
    return
  }

  if (error instanceof Error) {
    logWarning(`${context ?? "request"} · network`, error.message)
  }
}
