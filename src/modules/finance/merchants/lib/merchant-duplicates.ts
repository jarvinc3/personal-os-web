import type {
  FinanceMerchant,
  FinanceMerchantDuplicate,
  FinanceMerchantDuplicateReason,
} from "@/src/modules/finance/shared/types/entities"

/** Why the back thinks two merchants are the same one, in one short line. */
export const DUPLICATE_REASON_LABEL: Record<
  FinanceMerchantDuplicateReason,
  string
> = {
  SAME_KEY: "Mismo nombre sin acentos ni mayúsculas",
  ALIAS_MATCH: "Coincide con un nombre alternativo",
  TRAILING_NUMBER: "Solo difiere un número final",
  NAME_CONTAINED: "Un nombre contiene al otro",
  SIMILAR_NAME: "Nombre casi igual",
}

export function duplicateReasonLabel(
  reason: FinanceMerchantDuplicateReason
): string {
  return DUPLICATE_REASON_LABEL[reason] ?? "Nombre parecido"
}

/** The app chose the category, so the user can confirm or change it. */
export function hasSuggestedCategory(merchant: FinanceMerchant): boolean {
  return (
    merchant.categorySource === "LEARNED" ||
    merchant.categorySource === "KEYWORD"
  )
}

const MAX_NAMES = 2

/**
 * «Posible duplicado de A, B y 3 más»: the first names carry the message, the
 * count explains the rest without listing five merchants.
 */
export function duplicateNamesLabel(
  candidates: readonly FinanceMerchantDuplicate[]
): string {
  if (candidates.length === 0) {
    return ""
  }
  const shown = candidates.slice(0, MAX_NAMES).map((item) => `«${item.name}»`)
  const remaining = candidates.length - shown.length
  const joined =
    shown.length === 1
      ? shown[0]
      : `${shown.slice(0, -1).join(", ")} y ${shown[shown.length - 1]}`
  return remaining > 0 ? `${joined} y ${remaining} más` : joined
}
