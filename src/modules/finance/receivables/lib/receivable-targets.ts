import { parseFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import type { FinanceReceivable } from "@/src/modules/finance/shared/types/entities"

const CLOSED_STATUSES: readonly FinanceReceivable["status"][] = [
  "CANCELLED",
  "PAID",
  "WRITTEN_OFF",
]

export type ReceivableTarget = {
  id: string
  debtorName: string
  pending: number
}

type ReceivableTargetsInput = {
  receivables: FinanceReceivable[]
  excludeId: string | null
  currency?: string
}

/** Open receivables that can absorb the excess of another payment. */
export function receivableTargets({
  receivables,
  excludeId,
  currency,
}: ReceivableTargetsInput): ReceivableTarget[] {
  return receivables.flatMap((receivable) => {
    if (receivable.id === excludeId) {
      return []
    }
    if (CLOSED_STATUSES.includes(receivable.status)) {
      return []
    }
    if (
      currency &&
      receivable.currency.toUpperCase() !== currency.toUpperCase()
    ) {
      return []
    }
    const pending = receivablePending(receivable)
    if (pending === null || pending <= 0) {
      return []
    }
    return [{ id: receivable.id, debtorName: receivable.debtorName, pending }]
  })
}

function receivablePending(receivable: FinanceReceivable): number | null {
  const amount = parseFinanceMoney(receivable.amount)
  const paid = parseFinanceMoney(receivable.paidAmount) ?? 0
  const credit = parseFinanceMoney(receivable.creditBalance) ?? 0
  const writtenOff = parseFinanceMoney(receivable.writtenOffAmount) ?? 0
  if (amount === null) {
    return null
  }
  return amount - paid - credit - writtenOff
}
