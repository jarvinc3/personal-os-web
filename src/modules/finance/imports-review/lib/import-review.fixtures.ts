import type { ImportReviewItemPayload } from "@/src/modules/finance/shared/types/entities"

/**
 * Respuesta real de `GET /finance/imports/review`: el back guarda la señal
 * completa en `candidate` (relevancia, rutas, confianza y evidencia de la
 * importación), y los datos del movimiento viven en `candidate.transaction`.
 */
export const importReviewEndpointPayload: ImportReviewItemPayload[] = [
  {
    id: "import-1",
    signalId: "signal-1",
    sourceEmailMessageId: "message-1",
    reviewReason: "NO_LEDGER_TARGET",
    candidate: {
      relevance: true,
      semanticType: "FIN_TRANSACTION",
      routes: ["FINANCE"],
      confidence: 0.92,
      transaction: {
        kind: "TRANSACTION",
        amount: 1250,
        currency: "DOP",
        transactionDate: "2026-11-10T14:30:00.000Z",
        direction: "DEBIT",
        merchant: "Supermercado Ejemplo",
        bankReference: "REF-8891",
        movementClass: "PURCHASE",
        last4: "4821",
        categoryNameHint: "Supermercado",
      },
      financeImportEvidence: { reason: "NO_LEDGER_TARGET" },
    },
    createdAt: "2026-11-10T14:31:00.000Z",
    updatedAt: "2026-11-10T14:31:00.000Z",
  },
  {
    id: "import-2",
    signalId: "signal-2",
    sourceEmailMessageId: "message-2",
    reviewReason: "CARD_PAYMENT_SOURCE_ACCOUNT_AMBIGUOUS",
    candidate: {
      relevance: true,
      semanticType: "FIN_TRANSACTION",
      routes: ["FINANCE"],
      confidence: 0.88,
      transaction: {
        kind: "TRANSACTION",
        amount: 2500,
        currency: "DOP",
        suggestedTransactionDate: "2026-11-11T00:00:00.000Z",
        suggestedTransactionDateSource: "EMAIL_HEADER",
        direction: "DEBIT",
        movementClass: "CARD_PAYMENT",
        last4: "4821",
        accountNumberLast4: "0016",
      },
    },
    createdAt: "2026-11-11T09:00:00.000Z",
    updatedAt: "2026-11-11T09:00:00.000Z",
  },
]
