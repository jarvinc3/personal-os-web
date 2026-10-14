import type { FinanceBalanceDrift } from "@/src/modules/finance/shared/types/entities"

export type IntegrityProductRef =
  | { accountId: string; cardId?: never; currency?: never }
  | { accountId?: never; cardId: string; currency?: string }

/** Open drifts of one product; a credit card can have one per currency. */
export function findProductDrifts(
  drifts: readonly FinanceBalanceDrift[],
  product: IntegrityProductRef
): FinanceBalanceDrift[] {
  if (product.accountId) {
    return drifts.filter((drift) => drift.accountId === product.accountId)
  }
  return drifts.filter(
    (drift) =>
      drift.cardId === product.cardId &&
      (!product.currency ||
        drift.currency.toUpperCase() === product.currency.toUpperCase())
  )
}

/** Request body the recalculate endpoint expects for one drift. */
export function recalculationPayload(
  drift: FinanceBalanceDrift
): { accountId: string } | { cardId: string; currency: string } {
  if (drift.accountId) {
    return { accountId: drift.accountId }
  }
  if (drift.cardId) {
    return { cardId: drift.cardId, currency: drift.currency }
  }
  throw new Error("A balance drift must reference an account or a card")
}
