import type { PayloadResult } from "./ledger-fields.ts"
import { optionalId, optionalTrimmed } from "./ledger-fields.ts"
import { xorTarget } from "./ledger-target.ts"
import { parseFinanceMoney } from "./money.ts"

export type { PayloadResult } from "./ledger-fields.ts"
export {
  buildLedgerTargetOptions,
  encodeLedgerTarget,
  splitLedgerTarget,
} from "./ledger-target.ts"
export type { CreateTransferBody } from "./transfer-payloads.ts"
export { buildCreateTransferBody } from "./transfer-payloads.ts"

export type CreateTransactionBody = {
  accountId?: string
  cardId?: string
  type: "DEBIT" | "CREDIT"
  amount: number
  currency?: string
  transactionDate: string
  merchant?: string | null
  description?: string | null
  notes?: string | null
  categoryId?: string | null
  status?: "PENDING" | "CONFIRMED"
}

export type CreateCardPaymentBody = {
  fromAccountId: string
  cardId: string
  amount: number
  currency?: string
  transactionDate: string
  notes?: string
  /** Confirma un pago parecido a uno importado (409 del back). */
  duplicateAcknowledged?: boolean
}

/** A completed movement only accepts its non-monetary fields. */
export type UpdateTransactionMetadataBody = {
  categoryId?: string | null
  merchant?: string | null
  description?: string | null
  notes?: string | null
}

export type UpdateTransactionBody =
  CreateTransactionBody | UpdateTransactionMetadataBody

type TransactionFieldsInput = {
  currency?: string
  merchant?: string
  description?: string
  notes?: string
  categoryId?: string
  status?: string
}

function optionalTextField(
  value: string | undefined,
  isUpdate: boolean
): string | null | undefined {
  const trimmed = optionalTrimmed(value)
  if (trimmed) {
    return trimmed
  }
  return isUpdate ? null : undefined
}

function optionalIdField(
  value: string | undefined,
  isUpdate: boolean
): string | null | undefined {
  const id = optionalId(value)
  if (id) {
    return id
  }
  return isUpdate ? null : undefined
}

function transactionMetaFields(
  input: TransactionFieldsInput,
  isUpdate: boolean
): Pick<CreateTransactionBody, "currency" | "categoryId" | "status"> {
  const currency = optionalTrimmed(input.currency)?.toUpperCase()
  const categoryId = optionalIdField(input.categoryId, isUpdate)
  const status =
    input.status === "PENDING" || input.status === "CONFIRMED"
      ? input.status
      : undefined
  return {
    ...(currency ? { currency } : {}),
    ...(categoryId !== undefined ? { categoryId } : {}),
    ...(status ? { status } : {}),
  }
}

function transactionTextFields(
  input: TransactionFieldsInput,
  isUpdate: boolean
): Pick<CreateTransactionBody, "merchant" | "description" | "notes"> {
  const merchant = optionalTextField(input.merchant, isUpdate)
  const description = optionalTextField(input.description, isUpdate)
  const notes = optionalTextField(input.notes, isUpdate)
  return {
    ...(merchant !== undefined ? { merchant } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(notes !== undefined ? { notes } : {}),
  }
}

function transactionFields(
  input: TransactionFieldsInput,
  isUpdate: boolean
): Pick<
  CreateTransactionBody,
  "currency" | "merchant" | "description" | "notes" | "categoryId" | "status"
> {
  return {
    ...transactionMetaFields(input, isUpdate),
    ...transactionTextFields(input, isUpdate),
  }
}

export function buildCreateTransactionBody(
  input: {
    accountId?: string
    cardId?: string
    type: string
    amount: string
    currency?: string
    transactionDate: string
    merchant?: string
    description?: string
    notes?: string
    categoryId?: string
    status?: string
  },
  options?: { isUpdate?: boolean }
): PayloadResult<CreateTransactionBody> {
  if (input.type !== "DEBIT" && input.type !== "CREDIT") {
    return {
      ok: false,
      error: "Las transferencias usan POST /finance/transfers",
    }
  }
  const amount = parseFinanceMoney(input.amount)
  if (amount === null) {
    return { ok: false, error: "Monto inválido" }
  }
  const date = optionalTrimmed(input.transactionDate)
  if (!date) {
    return { ok: false, error: "Fecha obligatoria" }
  }
  const target = xorTarget(input.accountId, input.cardId, "el movimiento")
  if (!target.ok) {
    return { ok: false, error: target.error }
  }

  const isUpdate = Boolean(options?.isUpdate)
  const body: CreateTransactionBody = {
    type: input.type,
    amount,
    transactionDate: date,
    ...target.body,
    ...transactionFields(input, isUpdate),
  }
  return { ok: true, body }
}

export function buildTransactionMetadataBody(input: {
  categoryId?: string
  merchant?: string
  description?: string
  notes?: string
}): UpdateTransactionMetadataBody {
  return {
    categoryId: optionalId(input.categoryId) ?? null,
    merchant: optionalTrimmed(input.merchant) ?? null,
    description: optionalTrimmed(input.description) ?? null,
    notes: optionalTrimmed(input.notes) ?? null,
  }
}

export function buildCreateCardPaymentBody(input: {
  fromAccountId?: string
  cardId: string
  amount: string
  currency?: string
  transactionDate: string
  notes?: string
}): PayloadResult<CreateCardPaymentBody> {
  const amount = parseFinanceMoney(input.amount)
  if (amount === null) {
    return { ok: false, error: "Monto inválido" }
  }
  const transactionDate = optionalTrimmed(input.transactionDate)
  if (!transactionDate) {
    return { ok: false, error: "Fecha obligatoria" }
  }
  const fromAccountId = optionalId(input.fromAccountId)
  if (!fromAccountId) {
    return { ok: false, error: "Elige una cuenta de origen" }
  }

  const body: CreateCardPaymentBody = {
    fromAccountId,
    cardId: input.cardId,
    amount,
    transactionDate,
  }
  const currency = optionalTrimmed(input.currency)?.toUpperCase()
  if (currency) {
    body.currency = currency
  }
  const notes = optionalTrimmed(input.notes)
  if (notes) {
    body.notes = notes
  }
  return { ok: true, body }
}
