/**
 * Web Gmail OAuth: `returnTo` is always this app's `NEXT_PUBLIC_URL` origin
 * (local `http://localhost:3000`, never Vite `:5173`). The UI never accepts a
 * caller-supplied return URL (open-redirect).
 */

const FALLBACK_APP_URL = "http://localhost:3000"
export const GMAIL_OAUTH_RETURN_PATH = "/finance/sync/oauth"

export type PayloadResult<T> =
  | { ok: true; body: T }
  | { ok: false; error: string }

export type GoogleOAuthUrlQuery = {
  accountId?: string
  cardId?: string
  bankDomain?: string
  label?: string
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

export function buildGmailOAuthReturnTo(): string {
  return `${financeAppOrigin()}${GMAIL_OAUTH_RETURN_PATH}`
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

export function buildGoogleOAuthUrlSearch(
  input: GoogleOAuthUrlQuery,
): PayloadResult<string> {
  const accountId = optionalTrimmed(input.accountId)
  const cardId = optionalTrimmed(input.cardId)
  if (accountId && cardId) {
    return {
      ok: false,
      error: "Elige una cuenta o una tarjeta, no ambas",
    }
  }
  if (!accountId && !cardId) {
    return {
      ok: false,
      error: "Conectar Gmail necesita una cuenta o una tarjeta",
    }
  }

  const returnTo = buildGmailOAuthReturnTo()
  if (!isAppReturnTo(returnTo)) {
    return { ok: false, error: "returnTo is not an allowed origin" }
  }

  const params = new URLSearchParams({ returnTo })
  if (accountId) params.set("accountId", accountId)
  if (cardId) params.set("cardId", cardId)
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
