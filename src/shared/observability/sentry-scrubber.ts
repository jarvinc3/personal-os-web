import type { Event } from "@sentry/nextjs"

/** Value the scrubber writes over anything sensitive. */
export const SENTRY_REDACTED_VALUE = "[Filtered]"

const SENSITIVE_HEADER_NAMES = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "proxy-authorization",
])

const SENSITIVE_KEY_PATTERN =
  /token|password|secret|api[-_]?key|authorization|cookie/i

/**
 * Removes financial and credential data before an event leaves the browser:
 * the whole request body, cookies, auth headers, and any token-like key in
 * headers or query strings. Method, route, status, and user id (no email)
 * survive so an error stays actionable.
 */
export function scrubSentryEvent<T extends Event>(event: T): T {
  const request = event.request
  if (!request) {
    return event
  }

  return {
    ...event,
    request: {
      ...request,
      headers: scrubHeaders(request.headers),
      cookies: undefined,
      query_string: scrubQueryString(request.query_string),
      data: undefined,
    },
  } as T
}

function scrubHeaders(
  headers: Record<string, string> | undefined
): Record<string, string> | undefined {
  if (!headers) {
    return headers
  }

  const scrubbed: Record<string, string> = {}
  for (const [name, value] of Object.entries(headers)) {
    const normalized = name.toLowerCase()
    if (SENSITIVE_HEADER_NAMES.has(normalized)) {
      continue
    }
    scrubbed[name] = SENSITIVE_KEY_PATTERN.test(normalized)
      ? SENTRY_REDACTED_VALUE
      : value
  }
  return scrubbed
}

function scrubQueryString(
  query: string | Record<string, unknown> | [string, string][] | undefined
): string | Record<string, string> | [string, string][] | undefined {
  if (query === undefined) {
    return undefined
  }
  if (typeof query === "string") {
    return scrubQueryStringText(query)
  }
  if (Array.isArray(query)) {
    return query.map(([key, value]): [string, string] => [
      key,
      SENSITIVE_KEY_PATTERN.test(key) ? SENTRY_REDACTED_VALUE : value,
    ])
  }
  return scrubRecord(query)
}

function scrubQueryStringText(query: string): string {
  const leadingMark = query.startsWith("?") ? "?" : ""
  const params = new URLSearchParams(query)
  for (const key of [...params.keys()]) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      params.set(key, SENTRY_REDACTED_VALUE)
    }
  }
  return `${leadingMark}${params.toString()}`
}

function scrubRecord(record: Record<string, unknown>): Record<string, string> {
  const scrubbed: Record<string, string> = {}
  for (const [key, value] of Object.entries(record)) {
    scrubbed[key] = SENSITIVE_KEY_PATTERN.test(key)
      ? SENTRY_REDACTED_VALUE
      : String(value)
  }
  return scrubbed
}
