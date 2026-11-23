import { isSingleEmoji } from "@/src/shared/lib/single-emoji"
import type { FinanceCategoryType } from "@/src/modules/finance/shared/types/entities"
import type { PayloadResult } from "./catalog-fields.ts"
import { optionalId, optionalTrimmed } from "./catalog-fields.ts"

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
