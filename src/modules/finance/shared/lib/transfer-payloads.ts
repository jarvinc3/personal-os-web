import type { PayloadResult } from "./ledger-fields.ts"
import { optionalId, optionalTrimmed } from "./ledger-fields.ts"
import { xorTarget } from "./ledger-target.ts"
import { parseFinanceMoney } from "./money.ts"

export type CreateTransferBody = {
  fromAccountId?: string
  toAccountId?: string
  toCardId?: string
  amount: number
  currency?: string
  transactionDate: string
  description?: string
  notes?: string
  status?: "PENDING" | "CONFIRMED"
  rail?: string
  fee?: { amount: number }
  destinationPending?: boolean
  exchangeRate?: number
  receivedAmount?: number
}

type TransferFieldsInput = {
  currency?: string
  description?: string
  notes?: string
  status?: string
  rail?: string
  destinationPending?: boolean
}

type TransferParties = {
  fromAccountId: string
  toAccountId?: string
  toCardId?: string
}

function transferParties(input: {
  fromAccountId?: string
  toAccountId?: string
  toCardId?: string
}): PayloadResult<TransferParties> {
  const fromAccountId = optionalId(input.fromAccountId)
  if (!fromAccountId) {
    return { ok: false, error: "Elige una cuenta de origen" }
  }
  const to = xorTarget(input.toAccountId, input.toCardId, "el destino")
  if (!to.ok) {
    return { ok: false, error: to.error }
  }
  if (fromAccountId === to.body.accountId) {
    return { ok: false, error: "Origen y destino tienen que ser distintos" }
  }
  const parties: TransferParties = { fromAccountId }
  if (to.body.accountId !== undefined) {
    parties.toAccountId = to.body.accountId
  }
  if (to.body.cardId !== undefined) {
    parties.toCardId = to.body.cardId
  }
  return { ok: true, body: parties }
}

function transferDetails(
  input: TransferFieldsInput
): Pick<
  CreateTransferBody,
  | "currency"
  | "description"
  | "notes"
  | "status"
  | "rail"
  | "destinationPending"
> {
  const currency = optionalTrimmed(input.currency)?.toUpperCase()
  const description = optionalTrimmed(input.description)
  const notes = optionalTrimmed(input.notes)
  return {
    ...(currency ? { currency } : {}),
    ...(description ? { description } : {}),
    ...(notes ? { notes } : {}),
    ...(input.status === "PENDING" || input.status === "CONFIRMED"
      ? { status: input.status }
      : {}),
    ...(input.rail ? { rail: input.rail } : {}),
    ...(input.destinationPending ? { destinationPending: true } : {}),
  }
}

function transferAmounts(input: {
  exchangeRate?: string
  receivedAmount?: string
  feeAmount?: string
}): PayloadResult<
  Pick<CreateTransferBody, "exchangeRate" | "receivedAmount" | "fee">
> {
  const amounts: Pick<
    CreateTransferBody,
    "exchangeRate" | "receivedAmount" | "fee"
  > = {}
  const exchangeRate = optionalTrimmed(input.exchangeRate)
  if (exchangeRate) {
    const parsed = parseFinanceMoney(exchangeRate)
    if (parsed === null || parsed <= 0) {
      return { ok: false, error: "Tasa inválida" }
    }
    amounts.exchangeRate = parsed
  }
  const receivedAmount = optionalTrimmed(input.receivedAmount)
  if (receivedAmount) {
    const parsed = parseFinanceMoney(receivedAmount)
    if (parsed === null || parsed <= 0) {
      return { ok: false, error: "Monto recibido inválido" }
    }
    amounts.receivedAmount = parsed
  }
  const feeAmount = optionalTrimmed(input.feeAmount)
  if (feeAmount) {
    const parsed = parseFinanceMoney(feeAmount)
    if (parsed === null || parsed <= 0) {
      return { ok: false, error: "Monto de comisión inválido" }
    }
    amounts.fee = { amount: parsed }
  }
  return { ok: true, body: amounts }
}

export function buildCreateTransferBody(input: {
  fromAccountId?: string
  toAccountId?: string
  toCardId?: string
  amount: string
  currency?: string
  transactionDate: string
  description?: string
  notes?: string
  status?: string
  rail?: string
  feeAmount?: string
  destinationPending?: boolean
  exchangeRate?: string
  receivedAmount?: string
}): PayloadResult<CreateTransferBody> {
  const amount = parseFinanceMoney(input.amount)
  if (amount === null) {
    return { ok: false, error: "Monto inválido" }
  }
  const date = optionalTrimmed(input.transactionDate)
  if (!date) {
    return { ok: false, error: "Fecha obligatoria" }
  }
  const parties = transferParties(input)
  if (!parties.ok) {
    return { ok: false, error: parties.error }
  }
  const amounts = transferAmounts(input)
  if (!amounts.ok) {
    return { ok: false, error: amounts.error }
  }
  const body: CreateTransferBody = {
    amount,
    transactionDate: date,
    ...parties.body,
    ...transferDetails(input),
    ...amounts.body,
  }
  return { ok: true, body }
}
