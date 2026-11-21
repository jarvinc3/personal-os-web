import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"

/** Tanda de la hoja de conversaciones; el API acepta hasta 100. */
export const AGENT_CONVERSATIONS_PAGE_SIZE = 20

/** Ruta de una página del historial; sin cursor pide la primera tanda. */
export function buildAgentConversationsPath({
  cursor,
}: {
  cursor?: string
}): string {
  const params = new URLSearchParams({
    limit: String(AGENT_CONVERSATIONS_PAGE_SIZE),
  })

  if (cursor) {
    params.set("cursor", cursor)
  }

  return `${API_ENDPOINTS.INTELLIGENCE.CONVERSATIONS}?${params.toString()}`
}
