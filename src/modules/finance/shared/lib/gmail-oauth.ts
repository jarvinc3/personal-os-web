/**
 * Web Gmail OAuth: `returnTo` is always this app's `NEXT_PUBLIC_URL` origin.
 * Lands on Correos with the result sheet query; never a separate oauth page.
 */

import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"

const FALLBACK_APP_URL = "http://localhost:3000"
export const GMAIL_OAUTH_RETURN_PATH = APP_ROUTES.app.financeSync
export const GMAIL_OAUTH_RESULT_SHEET = FINANCE_SHEET_KEYS.oauthGmailResult

export type PayloadResult<T> =
  { ok: true; body: T } | { ok: false; error: string }

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

export function buildGmailOAuthReturnTo(): string {
  const url = new URL(GMAIL_OAUTH_RETURN_PATH, financeAppOrigin())
  url.searchParams.set("sheet", GMAIL_OAUTH_RESULT_SHEET)
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
  value: string | null | undefined
): "ok" | "error" | "none" {
  if (value === "true" || value === "1") {
    return "ok"
  }
  if (value === "false" || value === "0") {
    return "error"
  }
  return "none"
}

export function buildGoogleOAuthUrlSearch(input?: {
  label?: string
}): PayloadResult<string> {
  const returnTo = buildGmailOAuthReturnTo()
  if (!isAppReturnTo(returnTo)) {
    return { ok: false, error: "returnTo is not an allowed origin" }
  }

  const params = new URLSearchParams({ returnTo })
  const label = optionalTrimmed(input?.label)
  if (label) {
    params.set("label", label)
  }
  return { ok: true, body: params.toString() }
}

export function syncFailureReason(payload: unknown): string | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null
  }
  const record = payload as { queued?: unknown; reason?: unknown }
  if (record.queued !== false) {
    return null
  }
  if (typeof record.reason === "string" && record.reason.trim()) {
    return record.reason
  }
  return "No se pudo encolar el sync"
}
