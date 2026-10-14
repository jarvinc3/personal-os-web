import { parseFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import type { FinanceTransaction } from "@/src/modules/finance/shared/types/entities"

/** Row shown in a list: an original, optionally paired with its reversal. */
export type ReversalGroup = {
  original: FinanceTransaction
  /** The reversal leg when the pair was grouped as a total reversal. */
  reversal?: FinanceTransaction
  /** Amounts differ, so both legs stay as separate rows with the partial badge. */
  isPartial: boolean
  /** A reversal whose original is not among the loaded movements. */
  isOrphan: boolean
}

export const FINANCE_REVERSAL_PARTIAL_LABEL = "Reversa parcial"

function sameAmount(
  left: FinanceTransaction,
  right: FinanceTransaction
): boolean {
  const leftAmount = parseFinanceMoney(left.amount)
  const rightAmount = parseFinanceMoney(right.amount)
  if (leftAmount === null || rightAmount === null) {
    return left.amount === right.amount
  }
  return Math.abs(leftAmount) === Math.abs(rightAmount)
}

/** The reversal leg is the REVERSED one; the link carrier breaks a tie. */
function reversalLeg(
  item: FinanceTransaction,
  target: FinanceTransaction
): FinanceTransaction | null {
  if (item.status === "REVERSED") {
    return item
  }
  if (target.status === "REVERSED") {
    return target
  }
  return null
}

/**
 * Collapses each reversal with its original into one group. Items without a
 * loaded counterpart keep their own group, so a page split never hides a row.
 */
export function groupReversals(
  items: readonly FinanceTransaction[]
): ReversalGroup[] {
  const byId = new Map(items.map((item) => [item.id, item] as const))
  const reversalToOriginal = new Map<string, string>()
  const originalToReversal = new Map<string, string>()
  const pairedIds = new Set<string>()
  const partialIds = new Set<string>()

  for (const item of items) {
    const linkedId = item.linkedTransactionId
    if (!linkedId || linkedId === item.id) {
      continue
    }
    const target = byId.get(linkedId)
    if (!target) {
      continue
    }
    const reversal = reversalLeg(item, target)
    if (!reversal) {
      continue
    }
    const original = reversal.id === item.id ? target : item
    if (!sameAmount(original, reversal)) {
      partialIds.add(original.id)
      partialIds.add(reversal.id)
      continue
    }
    if (pairedIds.has(original.id) || pairedIds.has(reversal.id)) {
      continue
    }
    reversalToOriginal.set(reversal.id, original.id)
    originalToReversal.set(original.id, reversal.id)
    pairedIds.add(original.id)
    pairedIds.add(reversal.id)
  }

  const groups: ReversalGroup[] = []
  for (const item of items) {
    if (reversalToOriginal.has(item.id)) {
      continue
    }
    const reversalId = originalToReversal.get(item.id)
    const reversal = reversalId ? byId.get(reversalId) : undefined
    const linkedId = item.linkedTransactionId
    const isOrphan =
      !reversal &&
      !partialIds.has(item.id) &&
      item.status === "REVERSED" &&
      Boolean(linkedId) &&
      !byId.has(linkedId as string)
    groups.push({
      original: item,
      ...(reversal ? { reversal } : {}),
      isPartial: partialIds.has(item.id),
      isOrphan,
    })
  }
  return groups
}
