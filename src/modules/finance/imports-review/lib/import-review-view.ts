import { ApiError } from "@/src/config/api-client.utils"
import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import type {
  ImportReviewCandidate,
  ImportReviewItem,
  ImportReviewItemPayload,
} from "@/src/modules/finance/shared/types/entities"

const NOT_FOUND_STATUS = 404

/** El back manda códigos estables; el texto visible vive aquí y puede cambiar. */
const IMPORT_REVIEW_REASON_LABELS: Record<string, string> = {
  NOT_A_TRANSACTION: "El correo no describe un movimiento",
  CLASSIFICATION_UNAVAILABLE: "No se pudo leer el correo",
  INFERENCE_PROVIDER_FAILURE: "El lector de correos falló",
  NO_TRANSACTION_CANDIDATE: "No se encontró un movimiento en el correo",
  AMOUNT_MISSING: "El correo no trae el monto",
  CURRENCY_MISSING: "El correo no trae la moneda",
  TRANSACTION_DATE_MISSING: "Falta la fecha de la operación",
  TRANSACTION_DATE_SUGGESTED: "Solo hay una fecha sugerida por el encabezado",
  DIRECTION_MISSING: "No se sabe si el dinero entra o sale",
  NO_LEDGER_TARGET: "No se identificó la cuenta ni la tarjeta",
  AMBIGUOUS_LEDGER_TARGET: "Varias cuentas o tarjetas coinciden",
  TRANSFER_ACCOUNT_MISSING: "Falta la cuenta de la transferencia",
  TRANSFER_ACCOUNT_HINT_UNSUPPORTED:
    "Solo hay una tarjeta como pista de la cuenta",
  TRANSFER_ACCOUNT_NOT_FOUND: "Ninguna de tus cuentas coincide",
  TRANSFER_ACCOUNT_AMBIGUOUS: "Varias cuentas coinciden",
  TRANSFER_DIRECTION_AMBIGUOUS: "No se sabe la dirección de la transferencia",
  TRANSFER_SIDE_MISSING: "Falta el lado de la transferencia",
  TRANSFER_PAIR_AMBIGUOUS: "Varias transferencias podrían ser la contraparte",
  TRANSFER_REFERENCE_CONFLICT: "La referencia coincide con otra operación",
  CARD_PAYMENT_NOT_CONFIRMED: "El pago de tarjeta no está confirmado",
  CARD_PAYMENT_CARD_NOT_FOUND: "No encontramos la tarjeta del pago",
  CARD_PAYMENT_CARD_AMBIGUOUS: "Varias tarjetas coinciden",
  CARD_PAYMENT_CARD_NOT_CREDIT: "La tarjeta del pago no es de crédito",
  CARD_PAYMENT_SOURCE_ACCOUNT_NOT_FOUND:
    "No encontramos la cuenta de origen del pago",
  CARD_PAYMENT_SOURCE_ACCOUNT_AMBIGUOUS: "Varias cuentas de origen coinciden",
  CARD_CURRENCY_MISSING: "La tarjeta no tiene saldo en esa moneda",
  CARD_PAYMENT_POSSIBLE_DUPLICATE: "Ya hay un pago parecido",
  CARD_PAYMENT_REFERENCE_CONFLICT: "La referencia coincide con otro pago",
  CARD_PAYMENT_RECONCILIATION_AMBIGUOUS: "Varios pagos parecidos coinciden",
  REVERSAL_ORIGINAL_NOT_FOUND: "No encontramos la compra original",
  REVERSAL_REFERENCE_NOT_FOUND: "La referencia no apunta a una compra tuya",
  REVERSAL_COMMERCE_MISSING: "El reverso no dice qué compra devuelve",
  REVERSAL_ORIGINAL_AMBIGUOUS: "Varias compras podrían ser el original",
  REVERSAL_ORIGINAL_NOT_CONFIRMED: "La compra original no está confirmada",
  REVERSAL_TARGET_NOT_SUPPORTED:
    "El reverso de una transferencia o de un pago no se importa solo",
  REVERSAL_CURRENCY_MISMATCH: "La moneda del reverso no coincide",
  REVERSAL_EXCEEDS_ORIGINAL: "El reverso supera la compra original",
}

const IMPORT_REVIEW_MOVEMENT_LABELS: Record<string, string> = {
  PURCHASE: "Compra",
  INCOME: "Ingreso",
  PAYROLL: "Nómina",
  ATM_WITHDRAWAL: "Retiro en cajero",
  TRANSFER_OUT: "Transferencia enviada",
  TRANSFER_IN: "Transferencia recibida",
  CARD_PAYMENT: "Pago de tarjeta",
  FEE: "Cargo del banco",
  REFUND: "Reverso",
  OTHER: "Movimiento",
}

export type ImportReviewRow = {
  label: string
  value: string
}

function readText(source: Record<string, unknown>, key: string): string | null {
  const value = source[key]
  return typeof value === "string" && value.trim() ? value.trim() : null
}

function readAmount(
  source: Record<string, unknown>,
  key: string
): number | null {
  const value = source[key]
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

/**
 * El candidato llega como JSON del correo: se valida una vez y la vista confía
 * en el resultado. Un campo ausente o de otro tipo queda en null.
 */
export function readImportReviewCandidate(
  value: unknown
): ImportReviewCandidate {
  const source =
    typeof value === "object" && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {}
  return {
    amount: readAmount(source, "amount"),
    currency: readText(source, "currency"),
    transactionDate: readText(source, "transactionDate"),
    suggestedTransactionDate: readText(source, "suggestedTransactionDate"),
    merchant: readText(source, "merchant"),
    bankReference: readText(source, "bankReference"),
    movementClass: readText(source, "movementClass"),
    last4: readText(source, "last4"),
    accountNumberLast4: readText(source, "accountNumberLast4"),
  }
}

export function readImportReviewItem(
  payload: ImportReviewItemPayload
): ImportReviewItem {
  return { ...payload, candidate: readImportReviewCandidate(payload.candidate) }
}

/** Un código sin texto propio se muestra tal cual: no se oculta el motivo. */
export function importReviewReasonLabel(reason: string | null): string {
  if (!reason) {
    return "Sin motivo indicado"
  }
  return IMPORT_REVIEW_REASON_LABELS[reason] ?? reason
}

export function importReviewMovementLabel(
  movementClass: string | null
): string | null {
  if (!movementClass) {
    return null
  }
  return IMPORT_REVIEW_MOVEMENT_LABELS[movementClass] ?? null
}

export function importReviewAmountLabel(
  candidate: ImportReviewCandidate,
  display: FinanceMoneyDisplay
): string | null {
  if (candidate.amount === null) {
    return null
  }
  return formatFinanceMoney(candidate.amount, {
    ...display,
    currency: candidate.currency ?? display.currency,
  })
}

export function importReviewProductLabel(
  candidate: ImportReviewCandidate
): string | null {
  const products: string[] = []
  if (candidate.accountNumberLast4) {
    products.push(`Cuenta ****${candidate.accountNumberLast4}`)
  }
  if (candidate.last4) {
    products.push(`Tarjeta ****${candidate.last4}`)
  }
  return products.length > 0 ? products.join(" · ") : null
}

export function importReviewRows(
  candidate: ImportReviewCandidate,
  display: FinanceMoneyDisplay
): ImportReviewRow[] {
  const rows: ImportReviewRow[] = []
  const operationDate = candidate.transactionDate
  const date = operationDate ?? candidate.suggestedTransactionDate
  if (date) {
    rows.push({
      label: operationDate ? "Fecha" : "Fecha sugerida",
      value: formatCalendarDate(date, display.locale),
    })
  }
  if (candidate.merchant) {
    rows.push({ label: "Comercio", value: candidate.merchant })
  }
  if (candidate.bankReference) {
    rows.push({ label: "Referencia", value: candidate.bankReference })
  }
  const product = importReviewProductLabel(candidate)
  if (product) {
    rows.push({ label: "Producto", value: product })
  }
  return rows
}

export function importReviewReceivedLabel(
  createdAt: string,
  locale: string
): string | null {
  if (!createdAt) {
    return null
  }
  return `En revisión desde el ${formatCalendarDate(createdAt, locale)}`
}

/** El endpoint no existe en un entorno sin desplegar; tampoco hay endpoint propio del back. */
export function isImportReviewEndpointUnavailable(error: unknown): boolean {
  return error instanceof ApiError && error.status === NOT_FOUND_STATUS
}
