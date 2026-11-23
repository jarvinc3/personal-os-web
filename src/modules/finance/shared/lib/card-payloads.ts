import { FINANCE_QUICK_CURRENCIES } from "./finance-currency.ts"
import type { PayloadResult } from "./catalog-fields.ts"
import {
  optionalId,
  optionalTrimmed,
  optionalUpdateField,
} from "./catalog-fields.ts"
import { parseFinanceMoney } from "./money.ts"

type FinanceCardType = "CREDIT" | "DEBIT"
type FinanceCardNetwork = "VISA" | "MASTERCARD" | "AMEX" | "DISCOVER" | "OTHER"

export type CreateCardBody = {
  institutionId: string
  name: string
  type: FinanceCardType
  accountId?: string
  network?: FinanceCardNetwork
  lastFour: string
  statementClosingDay?: number
  paymentDueDay?: number
  color?: string | null
}

export type CardBalanceBody = {
  currency: string
  balance: number
  creditLimit?: number
}

export type CardBalanceInput = {
  currency: string
  balance: string
  creditLimit?: string
}

function parseOptionalDay(
  value: string | undefined
): { ok: true; value?: number } | { ok: false; error: string } {
  const raw = optionalTrimmed(value)
  if (!raw) {
    return { ok: true }
  }
  const day = Number(raw)
  if (!Number.isInteger(day) || day < 1 || day > 31) {
    return { ok: false, error: "El día debe estar entre 1 y 31" }
  }
  return { ok: true, value: day }
}

type CardOptionFields = Pick<
  CreateCardBody,
  "accountId" | "network" | "statementClosingDay" | "paymentDueDay" | "color"
>

function cardOptionFields(
  input: {
    type: FinanceCardType
    accountId?: string
    network?: string
    statementClosingDay?: string
    paymentDueDay?: string
    color?: string
  },
  isUpdate: boolean
): PayloadResult<CardOptionFields> {
  const fields: CardOptionFields = {}
  if (input.type === "DEBIT") {
    const accountId = optionalId(input.accountId)
    if (!accountId) {
      return { ok: false, error: "Las tarjetas de débito requieren una cuenta" }
    }
    fields.accountId = accountId
  }
  const network = optionalId(input.network)
  if (network) {
    fields.network = network as FinanceCardNetwork
  }
  const closing = parseOptionalDay(input.statementClosingDay)
  if (closing.ok === false) {
    return closing
  }
  if (closing.value !== undefined) {
    fields.statementClosingDay = closing.value
  }
  const due = parseOptionalDay(input.paymentDueDay)
  if (due.ok === false) {
    return due
  }
  if (due.value !== undefined) {
    fields.paymentDueDay = due.value
  }
  const color = optionalUpdateField(optionalTrimmed(input.color), isUpdate)
  if (color !== undefined) {
    fields.color = color
  }
  return { ok: true, body: fields }
}

export function buildCreateCardBody(
  input: {
    institutionId: string
    name: string
    type: FinanceCardType
    accountId?: string
    network?: string
    lastFour?: string
    statementClosingDay?: string
    paymentDueDay?: string
    color?: string
  },
  options?: { isUpdate?: boolean }
): PayloadResult<CreateCardBody> {
  const name = input.name.trim()
  if (!name) {
    return { ok: false, error: "Nombre obligatorio" }
  }

  const institutionId = optionalId(input.institutionId)
  if (!institutionId) {
    return { ok: false, error: "La tarjeta necesita una institución" }
  }

  const lastFour = optionalTrimmed(input.lastFour)
  if (!lastFour || !/^[0-9]{4}$/.test(lastFour)) {
    return { ok: false, error: "Últimos 4 dígitos obligatorios" }
  }

  const fields = cardOptionFields(input, options?.isUpdate === true)
  if (!fields.ok) {
    return fields
  }
  return {
    ok: true,
    body: {
      institutionId,
      name,
      type: input.type,
      lastFour,
      ...fields.body,
    },
  }
}

export function buildCardBalanceBody(
  input: {
    currency: string
    balance: string
    creditLimit?: string
  },
  options?: { requireCreditLimit?: boolean }
): PayloadResult<CardBalanceBody> {
  const currency = optionalTrimmed(input.currency)?.toUpperCase()
  if (!currency) {
    return { ok: false, error: "Moneda obligatoria" }
  }

  const balance = parseFinanceMoney(input.balance)
  if (balance === null) {
    return { ok: false, error: "Saldo inválido" }
  }

  const body: CardBalanceBody = { currency, balance }
  const limitRaw = optionalTrimmed(input.creditLimit)
  if (options?.requireCreditLimit && !limitRaw) {
    return { ok: false, error: "Límite de crédito obligatorio" }
  }
  if (limitRaw) {
    const creditLimit = parseFinanceMoney(limitRaw)
    if (creditLimit === null) {
      return { ok: false, error: "Límite inválido" }
    }
    body.creditLimit = creditLimit
  }

  return { ok: true, body }
}

function isEmptyBalanceRow(input: CardBalanceInput): boolean {
  return (
    optionalTrimmed(input.balance) === undefined &&
    optionalTrimmed(input.creditLimit) === undefined
  )
}

export function buildCardBalanceBodies(
  inputs: CardBalanceInput[],
  options?: { requireCreditLimit?: boolean }
): PayloadResult<CardBalanceBody[]> {
  const bodies: CardBalanceBody[] = []
  const seen = new Set<string>()

  for (const input of inputs) {
    if (isEmptyBalanceRow(input)) {
      continue
    }

    const parsed = buildCardBalanceBody(input, options)
    if (!parsed.ok) {
      return parsed
    }

    if (seen.has(parsed.body.currency)) {
      return { ok: false, error: "Cada moneda solo puede usarse una vez" }
    }
    seen.add(parsed.body.currency)
    bodies.push(parsed.body)
  }

  if (options?.requireCreditLimit && bodies.length === 0) {
    return { ok: false, error: "Límite de crédito obligatorio" }
  }

  return { ok: true, body: bodies }
}

const FALLBACK_CURRENCIES = [...FINANCE_QUICK_CURRENCIES]

export function nextUnusedCurrency(
  used: string[],
  preferred: string,
  trackedCurrencies: readonly string[] = []
): string {
  const taken = new Set(
    used.map((code) => code.trim().toUpperCase()).filter(Boolean)
  )
  const candidates = [preferred, ...trackedCurrencies, ...FALLBACK_CURRENCIES]
  for (const candidate of candidates) {
    const code = candidate.trim().toUpperCase()
    if (code && !taken.has(code)) {
      return code
    }
  }
  return preferred.trim().toUpperCase() || "USD"
}

export function cardBalanceSaveMessage(input: {
  created: boolean
  total: number
  failedCurrencies: string[]
}): { kind: "success" | "error"; text1: string; text2?: string } {
  if (input.failedCurrencies.length === 0) {
    return {
      kind: "success",
      text1: input.created ? "Tarjeta creada" : "Saldo actualizado",
    }
  }

  const failed = input.failedCurrencies.join(" · ")
  if (input.failedCurrencies.length < input.total) {
    return {
      kind: "error",
      text1: input.created
        ? "Tarjeta creada, pero algunos saldos no se guardaron"
        : "Algunos saldos no se guardaron",
      text2: failed,
    }
  }

  return {
    kind: "error",
    text1: input.created
      ? "Tarjeta creada, pero no se guardaron los saldos"
      : "No se pudieron guardar los saldos",
    text2: failed,
  }
}
