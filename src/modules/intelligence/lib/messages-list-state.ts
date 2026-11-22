export type MessagesListState =
  "loading" | "error" | "empty" | "hidden" | "list"

type MessagesListInput = {
  isPending: boolean
  isError: boolean
  hasRateLimitError: boolean
  messageCount: number
}

/**
 * El vacío por límite de solicitudes no pinta nada: el aviso ya explica la
 * espera y la lista conserva lo que tenía.
 */
export function resolveMessagesListState({
  isPending,
  isError,
  hasRateLimitError,
  messageCount,
}: MessagesListInput): MessagesListState {
  if (messageCount > 0) {
    return "list"
  }
  if (isPending) {
    return "loading"
  }
  if (isError && !hasRateLimitError) {
    return "error"
  }
  if (hasRateLimitError) {
    return "hidden"
  }
  return "empty"
}
