import { isSingleEmoji } from "@/src/shared/lib/single-emoji"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import type { FinanceCategoryType } from "@/src/modules/finance/shared/types/entities"
import { FINANCE_QUICK_CURRENCIES } from "./finance-currency.ts"
import { parseFinanceMoney } from "./money.ts"

type FinanceAccountType = "CHECKING" | "SAVINGS" | "CASH" | "INVESTMENT"
type FinanceCardType = "CREDIT" | "DEBIT"
type FinanceCardNetwork = "VISA" | "MASTERCARD" | "AMEX" | "DISCOVER" | "OTHER"

export type CreateAccountBody = {
  name: string
  type: FinanceAccountType
  institutionId?: string
  accountNumber?: string
  /** Solo los últimos 4, sin número completo (endpoints nativos). */
  accountNumberLast4?: string
  currency?: string
  color?: string | null
  isDefaultForInstitution?: boolean
}

export type CreateInstitutionBody = {
  name: string
  color?: string | null
  country?: string
  type?:
    "bank" | "credit_union" | "digital_wallet" | "broker" | "cash" | "other"
  shortName?: string | null
  sortOrder?: number
  domain?: string | null
}

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

export type CreateCategoryBody = {
  name: string
  icon?: string
  color?: string
  parentId?: string
  type: FinanceCategoryType
}

export type UpdateCategoryBody = {
  name: string
  icon?: string
  color?: string
  parentId: string | null
  type?: FinanceCategoryType
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

function digitsOnly(value: string | undefined): string {
  return (value ?? "").replace(/\D/g, "")
}

export function buildCreateAccountBody(
  input: {
    name: string
    type: FinanceAccountType
    currency?: string
    institutionId?: string
    accountNumber?: string
    color?: string
    isDefaultForInstitution?: boolean
  },
  options?: { isUpdate?: boolean; lastFourOnly?: boolean }
): PayloadResult<CreateAccountBody> {
  const name = input.name.trim()
  if (!name) {
    return { ok: false, error: "Nombre obligatorio" }
  }

  // Cash always lives in the system "Efectivo"; the API rejects any other
  // institution, so the form must not send one.
  const institutionId =
    input.type === "CASH" ? undefined : optionalId(input.institutionId)
  if (input.type !== "CASH" && !institutionId) {
    return { ok: false, error: "La cuenta necesita una institución" }
  }

  const accountNumber = digitsOnly(input.accountNumber)
  const isUpdate = options?.isUpdate === true
  const lastFourOnly = options?.lastFourOnly === true
  if (input.type === "CASH") {
    if (accountNumber) {
      return { ok: false, error: "El efectivo no usa número de cuenta" }
    }
  } else if (accountNumber.length === 0) {
    if (!isUpdate) {
      return {
        ok: false,
        error: "Número de cuenta obligatorio (4 a 34 dígitos)",
      }
    }
  } else if (accountNumber.length < 4 || accountNumber.length > 34) {
    return { ok: false, error: "Número de cuenta: 4 a 34 dígitos" }
  }

  const body: CreateAccountBody = {
    name,
    type: input.type,
  }
  if (institutionId) {
    body.institutionId = institutionId
  }
  if (accountNumber.length === 4 && lastFourOnly && !isUpdate) {
    body.accountNumberLast4 = accountNumber
  } else if (accountNumber) {
    body.accountNumber = accountNumber
  }

  const currency = optionalTrimmed(input.currency)?.toUpperCase()
  if (currency) {
    body.currency = currency
  }

  const color = optionalTrimmed(input.color)
  if (color) {
    body.color = color
  } else if (options?.isUpdate) {
    body.color = null
  }

  if (input.type !== "CASH" && input.isDefaultForInstitution) {
    body.isDefaultForInstitution = true
  } else if (options?.isUpdate && input.type !== "CASH") {
    body.isDefaultForInstitution = Boolean(input.isDefaultForInstitution)
  }

  return { ok: true, body }
}

export function buildCreateInstitutionBody(
  input: {
    name: string
    color?: string
    country?: string
    type?: CreateInstitutionBody["type"]
    shortName?: string
    sortOrder?: string
    domain?: string
  },
  options?: { isUpdate?: boolean }
): PayloadResult<CreateInstitutionBody> {
  const name = input.name.trim()
  if (!name) {
    return { ok: false, error: "Nombre obligatorio" }
  }

  const body: CreateInstitutionBody = { name }
  const color = optionalTrimmed(input.color)
  if (color) {
    body.color = color
  } else if (options?.isUpdate) {
    body.color = null
  }
  const country = optionalTrimmed(input.country)?.toUpperCase()
  if (country) {
    body.country = country
  }
  if (input.type) {
    body.type = input.type
  }
  const shortName = optionalTrimmed(input.shortName)
  if (shortName) {
    body.shortName = shortName
  } else if (options?.isUpdate) {
    body.shortName = null
  }
  const domain = optionalTrimmed(input.domain)?.toLowerCase()
  if (domain) {
    body.domain = domain
  } else if (options?.isUpdate) {
    body.domain = null
  }
  const sortOrder = optionalTrimmed(input.sortOrder)
  if (sortOrder) {
    const parsed = Number(sortOrder)
    if (!Number.isInteger(parsed) || parsed < 0) {
      return { ok: false, error: "El orden debe ser un número entero" }
    }
    body.sortOrder = parsed
  }

  return { ok: true, body }
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

  const body: CreateCardBody = {
    institutionId,
    name,
    type: input.type,
    lastFour,
  }

  if (input.type === "DEBIT") {
    const accountId = optionalId(input.accountId)
    if (!accountId) {
      return { ok: false, error: "Las tarjetas de débito requieren una cuenta" }
    }
    body.accountId = accountId
  }

  const network = optionalId(input.network)
  if (network) {
    body.network = network as FinanceCardNetwork
  }

  const closing = parseOptionalDay(input.statementClosingDay)
  if (closing.ok === false) {
    return closing
  }
  if (closing.value !== undefined) {
    body.statementClosingDay = closing.value
  }

  const due = parseOptionalDay(input.paymentDueDay)
  if (due.ok === false) {
    return due
  }
  if (due.value !== undefined) {
    body.paymentDueDay = due.value
  }

  const color = optionalTrimmed(input.color)
  if (color) {
    body.color = color
  } else if (options?.isUpdate) {
    body.color = null
  }

  return { ok: true, body }
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

export type CardBalanceInput = {
  currency: string
  balance: string
  creditLimit?: string
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

export function buildCreateCategoryBody(input: {
  name: string
  icon?: string
  color?: string
  parentId?: string
  type: FinanceCategoryType
}): PayloadResult<CreateCategoryBody> {
  const name = input.name.trim()
  if (!name) {
    return { ok: false, error: "Nombre obligatorio" }
  }

  const icon = optionalTrimmed(input.icon)
  if (icon && !isSingleEmoji(icon)) {
    return { ok: false, error: "El icono debe ser un emoji" }
  }

  const body: CreateCategoryBody = { name, type: input.type }
  if (icon) {
    body.icon = icon
  }
  const color = optionalTrimmed(input.color)
  if (color) {
    body.color = color
  }
  const parentId = optionalId(input.parentId)
  if (parentId) {
    body.parentId = parentId
  }

  return { ok: true, body }
}

export function buildUpdateCategoryBody(input: {
  name: string
  icon?: string
  color?: string
  parentId?: string
  type: FinanceCategoryType
  persistedParentId: string | null
}): PayloadResult<UpdateCategoryBody> {
  const created = buildCreateCategoryBody(input)
  if (!created.ok) {
    return created
  }

  const body: UpdateCategoryBody = {
    name: created.body.name,
    parentId: created.body.parentId ?? null,
  }
  if (created.body.icon) {
    body.icon = created.body.icon
  }
  if (created.body.color) {
    body.color = created.body.color
  }
  if (input.persistedParentId == null) {
    body.type = input.type
  }

  return { ok: true, body }
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
