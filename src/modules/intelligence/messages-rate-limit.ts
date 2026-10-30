import { ApiError } from "@/src/config/api-client.utils"

export const MESSAGES_RATE_LIMIT_MAX_AUTO_RETRIES = 2

const MESSAGES_RATE_LIMIT_BASE_MS = 2_000
const MESSAGES_RATE_LIMIT_MAX_MS = 30_000

export function getMessagesRateLimitError(error: unknown): ApiError | null {
  if (!(error instanceof ApiError) || error.status !== 429) {
    return null
  }
  return error
}

export function messagesRateLimitDelayMs({
  error,
  attempt,
}: {
  error: ApiError
  attempt: number
}): number {
  const backoff = MESSAGES_RATE_LIMIT_BASE_MS * 2 ** attempt
  return Math.min(error.retryAfterMs ?? backoff, MESSAGES_RATE_LIMIT_MAX_MS)
}
