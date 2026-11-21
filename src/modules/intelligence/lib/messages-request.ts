import {
  ALL_MESSAGE_STATUSES,
  type MessageStatusFilter,
} from "@/src/modules/intelligence/message-filters"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"

/** Tamaño de tanda de la lista de correos. */
export const INTELLIGENCE_PAGE_SIZE = 50

export type MessagesFilter = {
  query: string
  status: MessageStatusFilter
}

export type MessagesPageRequest = MessagesFilter & {
  cursor?: string | null
}

/** Recorta el texto una sola vez, para la consulta y para la clave de caché. */
export function normalizeMessagesFilter({
  query,
  status,
}: MessagesFilter): MessagesFilter {
  return { query: query.trim(), status }
}

/**
 * Ruta de una página de correos con el filtro aplicado en el API. El texto
 * vacío y el estado `ALL` se omiten: sin filtros llega la lista completa.
 */
export function buildMessagesPath({
  query,
  status,
  cursor,
}: MessagesPageRequest): string {
  const params = new URLSearchParams({
    limit: String(INTELLIGENCE_PAGE_SIZE),
  })
  const text = query.trim()

  if (text) {
    params.set("q", text)
  }
  if (status !== ALL_MESSAGE_STATUSES) {
    params.set("status", status)
  }
  if (cursor) {
    params.set("cursor", cursor)
  }

  return `${API_ENDPOINTS.INTELLIGENCE.MESSAGES}?${params.toString()}`
}
