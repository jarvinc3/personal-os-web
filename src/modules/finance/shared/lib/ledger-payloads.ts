import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import { parseFinanceMoney } from "./money.ts"

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
}

export type PayloadResult<T> =
  { ok: true; body: T } | { ok: false; error: string }

function optionalTrimmed(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function optionalId(value: string | undefined): string | undefined {
  const trimmed = optionalTrimmed(value)
  if (!trimmed || trimmed === CATALOG_NONE) {
    return undefined
  }
  return trimmed
}

export function encodeLedgerTarget(
  kind: "account" | "card",
  id: string
): string {
  return `${kind}:${id}`
}

export function splitLedgerTarget(value: string | undefined): {
  accountId?: string
  cardId?: string
} {
  const trimmed = optionalTrimmed(value)
  if (!trimmed || trimmed === CATALOG_NONE) {
    return {}
  }
  if (trimmed.startsWith("account:")) {
    const accountId = trimmed.slice("account:".length)
    return accountId ? { accountId } : {}
  }
  if (trimmed.startsWith("card:")) {
    const cardId = trimmed.slice("card:".length)
    return cardId ? { cardId } : {}
  }
  return {}
}

export function buildLedgerTargetOptions(
  accounts: { id: string; name: string }[],
  cards: { id: string; name: string }[]
): { value: string; label: string }[] {
  return [
    { value: CATALOG_NONE, label: "Elige cuenta o tarjeta" },
    ...accounts.map((account) => ({
      value: encodeLedgerTarget("account", account.id),
      label: `Cuenta · ${account.name}`,
    })),
    ...cards.map((card) => ({
      value: encodeLedgerTarget("card", card.id),
      label: `Tarjeta · ${card.name}`,
    })),
  ]
}

function xorTarget(
  accountId: string | undefined,
  cardId: string | undefined,
  label: string
): PayloadResult<{ accountId?: string; cardId?: string }> {
  const account = optionalId(accountId)
  const card = optionalId(cardId)
  if (Boolean(account) === Boolean(card)) {
    return {
      ok: false,
      error: `Elige una cuenta o una tarjeta para ${label}, no ambas ni ninguna`,
    }
  }
  return {
    ok: true,
    body: account ? { accountId: account } : { cardId: card },
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
  }
  const currency = optionalTrimmed(input.currency)?.toUpperCase()
  if (currency) {
    body.currency = currency
  }
  const merchant = optionalTrimmed(input.merchant)
  if (merchant) {
    body.merchant = merchant
  } else if (isUpdate) {
    body.merchant = null
  }
  const description = optionalTrimmed(input.description)
  if (description) {
    body.description = description
  } else if (isUpdate) {
    body.description = null
  }
  const notes = optionalTrimmed(input.notes)
  if (notes) {
    body.notes = notes
  } else if (isUpdate) {
    body.notes = null
  }
  const categoryId = optionalId(input.categoryId)
  if (categoryId) {
    body.categoryId = categoryId
  } else if (isUpdate) {
    body.categoryId = null
  }
  if (input.status === "PENDING" || input.status === "CONFIRMED") {
    body.status = input.status
  }
  return { ok: true, body }
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
}): PayloadResult<CreateTransferBody> {
  const amount = parseFinanceMoney(input.amount)
  if (amount === null) {
    return { ok: false, error: "Monto inválido" }
  }
  const date = optionalTrimmed(input.transactionDate)
  if (!date) {
    return { ok: false, error: "Fecha obligatoria" }
  }
  // A transfer always leaves an account: a card is a spending instrument, not
  // an origin the bank would accept.
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

  const body: CreateTransferBody = {
    amount,
    transactionDate: date,
    fromAccountId,
  }
  if (to.body.accountId) {
    body.toAccountId = to.body.accountId
  }
  if (to.body.cardId) {
    body.toCardId = to.body.cardId
  }
  const currency = optionalTrimmed(input.currency)?.toUpperCase()
  if (currency) {
    body.currency = currency
  }
  const description = optionalTrimmed(input.description)
  if (description) {
    body.description = description
  }
  const notes = optionalTrimmed(input.notes)
  if (notes) {
    body.notes = notes
  }
  if (input.status === "PENDING" || input.status === "CONFIRMED") {
    body.status = input.status
  }
  return { ok: true, body }
}
