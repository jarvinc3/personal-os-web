function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, "")
}

export function resolveApiBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim()
  const apiPrefix = process.env.NEXT_PUBLIC_API_PREFIX?.trim()

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not set")
  }

  return normalizeBaseUrl(
    `${apiUrl}${apiPrefix ? `/${apiPrefix.replace(/^\/+/, "")}` : ""}`
  )
}

export const API_BASE_URL = resolveApiBaseUrl()
