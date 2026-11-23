import type { PayloadResult } from "./catalog-fields.ts"
import { optionalTrimmed } from "./catalog-fields.ts"

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

function institutionSortOrder(
  value: string | undefined
): PayloadResult<number | undefined> {
  const sortOrder = optionalTrimmed(value)
  if (!sortOrder) {
    return { ok: true, body: undefined }
  }
  const parsed = Number(sortOrder)
  if (!Number.isInteger(parsed) || parsed < 0) {
    return { ok: false, error: "El orden debe ser un número entero" }
  }
  return { ok: true, body: parsed }
}

function applyInstitutionFields(
  body: CreateInstitutionBody,
  input: {
    color?: string
    country?: string
    type?: CreateInstitutionBody["type"]
    shortName?: string
    domain?: string
  },
  isUpdate: boolean
): void {
  const color = optionalTrimmed(input.color)
  if (color) {
    body.color = color
  } else if (isUpdate) {
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
  } else if (isUpdate) {
    body.shortName = null
  }
  const domain = optionalTrimmed(input.domain)?.toLowerCase()
  if (domain) {
    body.domain = domain
  } else if (isUpdate) {
    body.domain = null
  }
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
  applyInstitutionFields(body, input, options?.isUpdate === true)

  const sortOrder = institutionSortOrder(input.sortOrder)
  if (!sortOrder.ok) {
    return sortOrder
  }
  if (sortOrder.body !== undefined) {
    body.sortOrder = sortOrder.body
  }

  return { ok: true, body }
}
