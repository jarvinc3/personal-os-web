import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"

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
