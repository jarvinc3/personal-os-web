"use client"

import { apiGet } from "@/src/config/api-client"
import {
  buildGoogleOAuthUrlSearch,
  type GoogleOAuthUrlQuery,
} from "@/src/modules/finance/lib/gmail-oauth"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { useMutation } from "@tanstack/react-query"

export function useStartGmailOAuth() {
  return useMutation({
    mutationFn: async (input: GoogleOAuthUrlQuery) => {
      const search = buildGoogleOAuthUrlSearch(input)
      if (!search.ok) {
        throw new Error(search.error)
      }
      const payload = await apiGet<{ url: string }>(
        `${API_ENDPOINTS.FINANCE.OAUTH_GOOGLE_URL}?${search.body}`,
      )
      if (!payload?.url || typeof payload.url !== "string") {
        throw new Error("No se pudo obtener la URL de Google")
      }
      const google = new URL(payload.url)
      if (google.hostname !== "accounts.google.com") {
        throw new Error("La URL de OAuth no apunta a Google")
      }
      window.location.assign(payload.url)
    },
  })
}
