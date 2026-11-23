import type { PayloadResult } from "./catalog-fields.ts"
import { optionalTrimmed, optionalUpdateField } from "./catalog-fields.ts"

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

function institutionOptionFields(
  input: {
    color?: string
    country?: string
    type?: CreateInstitutionBody["type"]
    shortName?: string
    domain?: string
  },
  isUpdate: boolean
): Pick<
  CreateInstitutionBody,
  "color" | "country" | "type" | "shortName" | "domain"
> {
  const color = optionalUpdateField(optionalTrimmed(input.color), isUpdate)
  const country = optionalTrimmed(input.country)?.toUpperCase()
  const shortName = optionalUpdateField(
    optionalTrimmed(input.shortName),
    isUpdate
  )
  const domain = optionalUpdateField(
    optionalTrimmed(input.domain)?.toLowerCase(),
    isUpdate
  )
  return {
    ...(color !== undefined ? { color } : {}),
    ...(country ? { country } : {}),
    ...(input.type ? { type: input.type } : {}),
    ...(shortName !== undefined ? { shortName } : {}),
    ...(domain !== undefined ? { domain } : {}),
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

  const sortOrder = institutionSortOrder(input.sortOrder)
  if (!sortOrder.ok) {
    return sortOrder
  }
  return {
    ok: true,
    body: {
      name,
      ...institutionOptionFields(input, options?.isUpdate === true),
      ...(sortOrder.body !== undefined ? { sortOrder: sortOrder.body } : {}),
    },
  }
}
