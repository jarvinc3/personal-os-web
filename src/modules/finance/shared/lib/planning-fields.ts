import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import { parseFinanceMoney } from "./money.ts"

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export type PayloadResult<T> =
  { ok: true; body: T } | { ok: false; error: string }

export function optionalTrimmed(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

export function optionalId(value: string | undefined): string | undefined {
  const trimmed = optionalTrimmed(value)
  if (!trimmed || trimmed === CATALOG_NONE) {
    return undefined
  }
  return trimmed
}

export function requiredMoney(
  value: string,
  label: string
): PayloadResult<number> {
  const amount = parseFinanceMoney(value)
  if (amount === null) {
    return { ok: false, error: `${label} inválido` }
  }
  return { ok: true, body: amount }
}

export function parseIntField(
  value: string,
  label: string,
  min: number
): PayloadResult<number> {
  const trimmed = value.trim()
  if (!trimmed) {
    return { ok: false, error: `${label} obligatorio` }
  }
  const parsed = Number(trimmed)
  if (!Number.isInteger(parsed) || parsed < min) {
    return { ok: false, error: `${label} inválido` }
  }
  return { ok: true, body: parsed }
}

export function optionalIsoDate(
  value: string | undefined
): PayloadResult<string | undefined> {
  const trimmed = optionalTrimmed(value)
  if (!trimmed) {
    return { ok: true, body: undefined }
  }
  if (!ISO_DATE.test(trimmed)) {
    return { ok: false, error: "Fecha inválida" }
  }
  return { ok: true, body: trimmed }
}
