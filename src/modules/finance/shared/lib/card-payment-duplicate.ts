import { ApiError } from "@/src/config/api-client.utils"

const CONFLICT_STATUS = 409
const CARD_PAYMENT_POSSIBLE_DUPLICATE = "CARD_PAYMENT_POSSIBLE_DUPLICATE"

/** El pago importado que el back señala como parecido al manual. */
export type CardPaymentDuplicate = {
  amount: string | null
  currency: string | null
  transactionDate: string | null
}

function readText(source: Record<string, unknown>, key: string): string | null {
  const value = source[key]
  return typeof value === "string" && value.trim() ? value.trim() : null
}

function readCandidate(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {}
  }
  return value as Record<string, unknown>
}

/**
 * El 409 `CARD_PAYMENT_POSSIBLE_DUPLICATE` del pago manual trae el candidato
 * importado en `details.candidate`. Cualquier otro fallo devuelve null.
 */
export function cardPaymentDuplicateFromError(
  error: unknown
): CardPaymentDuplicate | null {
  if (
    !(error instanceof ApiError) ||
    error.status !== CONFLICT_STATUS ||
    error.code !== CARD_PAYMENT_POSSIBLE_DUPLICATE
  ) {
    return null
  }
  const candidate = readCandidate(error.details?.candidate)
  return {
    amount: readText(candidate, "amount"),
    currency: readText(candidate, "currency"),
    transactionDate: readText(candidate, "transactionDate"),
  }
}
