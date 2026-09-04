/**
 * Web Gmail OAuth: `returnTo` is always this app's `NEXT_PUBLIC_URL` origin
 * (local `http://localhost:3000`, never Vite `:5173`). The UI never accepts a
 * caller-supplied return URL (open-redirect).
 */

import { APP_ROUTES } from "../../../shared/constants/app-routes.ts"

const FALLBACK_APP_URL = "http://localhost:3000"
export const GMAIL_OAUTH_RETURN_PATH = "/finance/sync/oauth"

export const GMAIL_OAUTH_NEXT_PATHS = [
  APP_ROUTES.app.financeSync,
  APP_ROUTES.app.financeAccounts,
] as const

export type GmailOAuthNextPath = (typeof GMAIL_OAUTH_NEXT_PATHS)[number]

export type PayloadResult<T> =
  | { ok: true; body: T }
  | { ok: false; error: string }

export type GoogleOAuthUrlQuery = {
  institutionId?: string
  bankDomain?: string
  label?: string
  nextPath?: GmailOAuthNextPath
}

function optionalTrimmed(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

export function financeAppOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_URL?.trim() || FALLBACK_APP_URL
  try {
    return new URL(raw).origin
  } catch {
    return new URL(FALLBACK_APP_URL).origin
  }
}

export function buildGmailOAuthReturnTo(
  nextPath: GmailOAuthNextPath = APP_ROUTES.app.financeSync,
): string {
  const url = new URL(GMAIL_OAUTH_RETURN_PATH, financeAppOrigin())
  url.searchParams.set("next", nextPath)
  return url.toString()
}

export function isAppReturnTo(returnTo: string): boolean {
  try {
    return new URL(returnTo).origin === financeAppOrigin()
  } catch {
    return false
  }
}

export function parseOAuthSuccessParam(
  value: string | null | undefined,
): "ok" | "error" | "none" {
  if (value === "true" || value === "1") return "ok"
  if (value === "false" || value === "0") return "error"
  return "none"
}

export function parseOAuthNextPath(
  value: string | null | undefined,
): GmailOAuthNextPath {
  if (
    value === APP_ROUTES.app.financeAccounts ||
    value === APP_ROUTES.app.financeSync
  ) {
    return value
  }
  return APP_ROUTES.app.financeSync
}

export function buildGoogleOAuthUrlSearch(
  input: GoogleOAuthUrlQuery,
): PayloadResult<string> {
  const institutionId = optionalTrimmed(input.institutionId)
  if (!institutionId) {
    return {
      ok: false,
      error: "Conectar Gmail necesita una institución",
    }
  }

  const nextPath = input.nextPath ?? APP_ROUTES.app.financeSync
  const returnTo = buildGmailOAuthReturnTo(nextPath)
  if (!isAppReturnTo(returnTo)) {
    return { ok: false, error: "returnTo is not an allowed origin" }
  }

  const params = new URLSearchParams({ returnTo, institutionId })
  const bankDomain = optionalTrimmed(input.bankDomain)
  const label = optionalTrimmed(input.label)
  if (bankDomain) params.set("bankDomain", bankDomain)
  if (label) params.set("label", label)
  return { ok: true, body: params.toString() }
}

export function syncFailureReason(payload: unknown): string | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null
  }
  const record = payload as { queued?: unknown; reason?: unknown }
  if (record.queued !== false) return null
  if (typeof record.reason === "string" && record.reason.trim()) {
    return record.reason
  }
  return "No se pudo encolar el sync"
}
