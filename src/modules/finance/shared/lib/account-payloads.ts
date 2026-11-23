import type { PayloadResult } from "./catalog-fields.ts"
import { digitsOnly, optionalId, optionalTrimmed } from "./catalog-fields.ts"

type FinanceAccountType = "CHECKING" | "SAVINGS" | "CASH" | "INVESTMENT"

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

type AccountNumberFields = {
  accountNumber?: string
  accountNumberLast4?: string
}

function accountInstitution(input: {
  type: FinanceAccountType
  institutionId?: string
}): PayloadResult<string | undefined> {
  // Cash always lives in the system "Efectivo"; the API rejects any other
  // institution, so the form must not send one.
  if (input.type === "CASH") {
    return { ok: true, body: undefined }
  }
  const institutionId = optionalId(input.institutionId)
  if (!institutionId) {
    return { ok: false, error: "La cuenta necesita una institución" }
  }
  return { ok: true, body: institutionId }
}

function accountNumberFields(
  input: {
    type: FinanceAccountType
    accountNumber?: string
  },
  isUpdate: boolean,
  lastFourOnly: boolean
): PayloadResult<AccountNumberFields> {
  const accountNumber = digitsOnly(input.accountNumber)
  if (input.type === "CASH") {
    return accountNumber
      ? { ok: false, error: "El efectivo no usa número de cuenta" }
      : { ok: true, body: {} }
  }
  if (accountNumber.length === 0) {
    return isUpdate
      ? { ok: true, body: {} }
      : {
          ok: false,
          error: "Número de cuenta obligatorio (4 a 34 dígitos)",
        }
  }
  if (accountNumber.length < 4 || accountNumber.length > 34) {
    return { ok: false, error: "Número de cuenta: 4 a 34 dígitos" }
  }
  if (accountNumber.length === 4 && lastFourOnly && !isUpdate) {
    return { ok: true, body: { accountNumberLast4: accountNumber } }
  }
  return { ok: true, body: { accountNumber } }
}

function applyAccountOptions(
  body: CreateAccountBody,
  input: {
    type: FinanceAccountType
    currency?: string
    color?: string
    isDefaultForInstitution?: boolean
  },
  isUpdate: boolean
): void {
  const currency = optionalTrimmed(input.currency)?.toUpperCase()
  if (currency) {
    body.currency = currency
  }

  const color = optionalTrimmed(input.color)
  if (color) {
    body.color = color
  } else if (isUpdate) {
    body.color = null
  }

  if (input.type !== "CASH" && input.isDefaultForInstitution) {
    body.isDefaultForInstitution = true
  } else if (isUpdate && input.type !== "CASH") {
    body.isDefaultForInstitution = Boolean(input.isDefaultForInstitution)
  }
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

  const institution = accountInstitution(input)
  if (!institution.ok) {
    return institution
  }

  const isUpdate = options?.isUpdate === true
  const numbers = accountNumberFields(
    input,
    isUpdate,
    options?.lastFourOnly === true
  )
  if (!numbers.ok) {
    return numbers
  }

  const body: CreateAccountBody = {
    name,
    type: input.type,
    ...(institution.body ? { institutionId: institution.body } : {}),
    ...numbers.body,
  }
  applyAccountOptions(body, input, isUpdate)
  return { ok: true, body }
}
