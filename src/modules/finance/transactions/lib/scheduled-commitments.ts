import type {
  FinanceLoan,
  FinanceSubscriptionUpcomingCharge,
} from "@/src/modules/finance/shared/types/entities"

export type ScheduledCommitmentKind = "LOAN" | "SUBSCRIPTION"

/** One known future charge shown in the month without touching its totals. */
export type ScheduledCommitment = {
  id: string
  kind: ScheduledCommitmentKind
  referenceId: string
  name: string
  amount: string
  currency: string
  /** Date-only `YYYY-MM-DD`; it is the day the charge is due. */
  date: string
  hasPaymentMethod: boolean
}

/** Next pending instalment of every active loan, from `fromDate` onward. */
export function loanCommitments({
  loans,
  fromDate,
}: {
  loans: readonly FinanceLoan[]
  fromDate: string
}): ScheduledCommitment[] {
  return loans.flatMap((loan) => {
    if (
      !loan.isActive ||
      loan.paidInstallments >= loan.totalInstallments ||
      loan.nextDueDate.slice(0, 10) < fromDate
    ) {
      return []
    }
    return [
      {
        id: `loan:${loan.id}`,
        kind: "LOAN" as const,
        referenceId: loan.id,
        name: loan.lenderName,
        amount: loan.installmentAmount,
        currency: loan.currency,
        date: loan.nextDueDate.slice(0, 10),
        hasPaymentMethod: loan.accountId !== null,
      },
    ]
  })
}

/** Charges returned by the subscriptions upcoming endpoint, one per occurrence. */
export function subscriptionCommitments(
  charges: readonly FinanceSubscriptionUpcomingCharge[]
): ScheduledCommitment[] {
  return charges.map((charge) => ({
    id: charge.id,
    kind: "SUBSCRIPTION" as const,
    referenceId: charge.subscriptionId,
    name: charge.name,
    amount: charge.amount,
    currency: charge.currency,
    date: charge.date.slice(0, 10),
    hasPaymentMethod: charge.paymentMethod !== null,
  }))
}

/** Commitments grouped by `YYYY-MM`, each month ordered by date and name. */
export function groupCommitmentsByMonth(
  commitments: readonly ScheduledCommitment[]
): Map<string, ScheduledCommitment[]> {
  const byMonth = new Map<string, ScheduledCommitment[]>()
  for (const commitment of commitments) {
    const month = commitment.date.slice(0, 7)
    const group = byMonth.get(month) ?? []
    group.push(commitment)
    byMonth.set(month, group)
  }
  for (const group of byMonth.values()) {
    group.sort(
      (left, right) =>
        left.date.localeCompare(right.date) ||
        left.name.localeCompare(right.name)
    )
  }
  return byMonth
}
