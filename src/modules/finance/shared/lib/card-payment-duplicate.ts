import { ApiError } from "@/src/config/api-client.utils"
import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import type { CreateCardPaymentBody } from "@/src/modules/finance/shared/lib/ledger-payloads"
import { instantToZonedDate } from "@/src/shared/lib/zoned-time"

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

/**
 * El ledger muestra las fechas en la zona del perfil; el 409 manda el instante
 * en UTC y sin convertir podría caer en otro día.
 */
export function cardPaymentDuplicateDateLabel(
  candidate: CardPaymentDuplicate,
  { timeZone, locale }: { timeZone: string; locale: string }
): string | null {
  if (!candidate.transactionDate) {
    return null
  }
  return formatCalendarDate(
    instantToZonedDate(candidate.transactionDate, timeZone),
    locale
  )
}

export type CardPaymentDuplicateDialog = {
  /** El cuerpo enviado, para reenviarlo igual con la confirmación. */
  body: CreateCardPaymentBody
  candidate: CardPaymentDuplicate
} | null

export type CardPaymentDuplicateEvent =
  | {
      type: "CONFLICT"
      body: CreateCardPaymentBody
      candidate: CardPaymentDuplicate
    }
  | { type: "CANCELLED" }
  | { type: "CONFIRMED" }
  | { type: "ACKNOWLEDGEMENT_FAILED" }

/**
 * El diálogo sigue abierto hasta que el reenvío confirmado termina: un fallo
 * conserva el candidato para reintentar, y solo cancelar o guardar lo cierran.
 */
export function nextCardPaymentDuplicateDialog(
  current: CardPaymentDuplicateDialog,
  event: CardPaymentDuplicateEvent
): CardPaymentDuplicateDialog {
  switch (event.type) {
    case "CONFLICT":
      return { body: event.body, candidate: event.candidate }
    case "ACKNOWLEDGEMENT_FAILED":
      return current
    case "CANCELLED":
    case "CONFIRMED":
      return null
  }
}
