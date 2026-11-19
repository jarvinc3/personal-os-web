/** Estados de análisis que puede tener un correo (`processingStatus`). */
export const MESSAGE_STATUS_LABELS = {
  INGESTED: "Recibido",
  QUEUED: "En cola",
  PROCESSED: "Procesado",
  REVIEW_REQUIRED: "En revisión",
  FAILED: "Falló",
  DISCARDED: "Descartado",
} as const

export type MessageStatus = keyof typeof MESSAGE_STATUS_LABELS
export const ALL_MESSAGE_STATUSES = "ALL" as const
export type MessageStatusFilter = MessageStatus | typeof ALL_MESSAGE_STATUSES

type FilterableMessage = {
  subject: string
  fromAddress: string
  processingStatus: string
}

/**
 * Filtra los correos ya cargados por texto y por estado. La lista se pagina por
 * cursor y el API no busca, así que el filtro alcanza solo a lo que está en
 * memoria; la vista lo dice antes de mostrar resultados.
 */
export function filterLoadedMessages<T extends FilterableMessage>({
  messages,
  query,
  status,
}: {
  messages: readonly T[]
  query: string
  status: MessageStatusFilter
}): T[] {
  const needle = query.trim().toLowerCase()
  return messages.filter((message) => {
    if (
      status !== ALL_MESSAGE_STATUSES &&
      message.processingStatus !== status
    ) {
      return false
    }
    if (!needle) {
      return true
    }
    return (
      message.subject.toLowerCase().includes(needle) ||
      message.fromAddress.toLowerCase().includes(needle)
    )
  })
}
