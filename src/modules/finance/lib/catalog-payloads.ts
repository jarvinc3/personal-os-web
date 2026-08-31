import { parseFinanceMoney } from "./money.ts"

type FinanceAccountType = "CHECKING" | "SAVINGS" | "CASH" | "INVESTMENT"
type FinanceCardType = "CREDIT" | "DEBIT"
type FinanceCardNetwork = "VISA" | "MASTERCARD" | "AMEX" | "DISCOVER" | "OTHER"

const CATALOG_NONE = "__none__"

export type CreateAccountBody = {
  name: string
  type: FinanceAccountType
  currency?: string
  institutionId?: string
  institution?: string
  color?: string
}

export type CreateInstitutionBody = {
  name: string
  color?: string
  logoUrl?: string
  country?: string
}

export type CreateCardBody = {
  institutionId: string
  name: string
  type: FinanceCardType
  accountId?: string
  network?: FinanceCardNetwork
  lastFour?: string
  statementClosingDay?: number
  paymentDueDay?: number
  color?: string
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
}

export type PayloadResult<T> =
  | { ok: true; body: T }
  | { ok: false; error: string }

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

export function buildCreateAccountBody(input: {
  name: string
  type: FinanceAccountType
  currency?: string
  institutionId?: string
  institution?: string
  color?: string
}): PayloadResult<CreateAccountBody> {
  const name = input.name.trim()
  if (!name) {
    return { ok: false, error: "Nombre obligatorio" }
  }

  const body: CreateAccountBody = {
    name,
    type: input.type,
  }

  const currency = optionalTrimmed(input.currency)?.toUpperCase()
  if (currency) {
    body.currency = currency
  }

  const institutionId = optionalId(input.institutionId)
  if (institutionId) {
    body.institutionId = institutionId
  } else {
    const institution = optionalTrimmed(input.institution)
    if (institution) {
      body.institution = institution
    }
  }

  const color = optionalTrimmed(input.color)
  if (color) {
    body.color = color
  }

  return { ok: true, body }
}

export function buildCreateInstitutionBody(input: {
  name: string
  color?: string
  logoUrl?: string
  country?: string
}): PayloadResult<CreateInstitutionBody> {
  const name = input.name.trim()
  if (!name) {
    return { ok: false, error: "Nombre obligatorio" }
  }

  const body: CreateInstitutionBody = { name }
  const color = optionalTrimmed(input.color)
  if (color) body.color = color
  const logoUrl = optionalTrimmed(input.logoUrl)
  if (logoUrl) body.logoUrl = logoUrl
  const country = optionalTrimmed(input.country)?.toUpperCase()
  if (country) body.country = country

  return { ok: true, body }
}

export function buildCreateCardBody(input: {
  institutionId: string
  name: string
  type: FinanceCardType
  accountId?: string
  network?: string
  lastFour?: string
  statementClosingDay?: string
  paymentDueDay?: string
  color?: string
}): PayloadResult<CreateCardBody> {
  const name = input.name.trim()
  if (!name) {
    return { ok: false, error: "Nombre obligatorio" }
  }

  const institutionId = optionalId(input.institutionId)
  if (!institutionId) {
    return { ok: false, error: "La tarjeta necesita una institución" }
  }

  const body: CreateCardBody = {
    institutionId,
    name,
    type: input.type,
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

  const lastFour = optionalTrimmed(input.lastFour)
  if (lastFour) {
    body.lastFour = lastFour
  }

  const closing = parseOptionalDay(input.statementClosingDay)
  if (closing.ok === false) return closing
  if (closing.value !== undefined) body.statementClosingDay = closing.value

  const due = parseOptionalDay(input.paymentDueDay)
  if (due.ok === false) return due
  if (due.value !== undefined) body.paymentDueDay = due.value

  const color = optionalTrimmed(input.color)
  if (color) body.color = color

  return { ok: true, body }
}

export function buildCardBalanceBody(input: {
  currency: string
  balance: string
  creditLimit?: string
}): PayloadResult<CardBalanceBody> {
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
  if (limitRaw) {
    const creditLimit = parseFinanceMoney(limitRaw)
    if (creditLimit === null) {
      return { ok: false, error: "Límite inválido" }
    }
    body.creditLimit = creditLimit
  }

  return { ok: true, body }
}

const LUCIDE_KEY = /^[a-z][a-z0-9-]*$/i

export function buildCreateCategoryBody(input: {
  name: string
  icon?: string
  color?: string
  parentId?: string
}): PayloadResult<CreateCategoryBody> {
  const name = input.name.trim()
  if (!name) {
    return { ok: false, error: "Nombre obligatorio" }
  }

  const icon = optionalTrimmed(input.icon)
  if (!icon) {
    return { ok: false, error: "El icono debe ser un emoji" }
  }
  if (LUCIDE_KEY.test(icon)) {
    return { ok: false, error: "Usa un emoji (por ejemplo 🛒), no una key Lucide" }
  }

  const body: CreateCategoryBody = { name, icon }
  const color = optionalTrimmed(input.color)
  if (color) body.color = color
  const parentId = optionalId(input.parentId)
  if (parentId) body.parentId = parentId

  return { ok: true, body }
}

function parseOptionalDay(
  value: string | undefined,
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
