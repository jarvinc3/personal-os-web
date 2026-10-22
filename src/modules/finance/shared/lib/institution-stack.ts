import { formatFinanceMoney, type FinanceMoneyDisplay } from "./money.ts"
import { isCashInstitution } from "./cash.ts"
import type {
  FinanceAccount,
  FinanceBalanceDrift,
  FinanceBalanceSheetCurrencySlice,
  FinanceBalanceSheetIssue,
  FinanceBalanceSheetStatus,
  FinanceCard,
  FinanceCashSummary,
  FinanceInstitution,
  FinanceLoan,
  FinanceReconciliationStatusItem,
} from "@/src/modules/finance/shared/types/entities"

export type InstitutionStackCounts = {
  accounts: number
  cards: number
  loans: number
}

export type InstitutionIrregularities = {
  drift: boolean
  reconciliation: boolean
}

export type InstitutionStackItem =
  | {
      kind: "institution"
      id: string
      institution: FinanceInstitution
      counts: InstitutionStackCounts
      status: FinanceBalanceSheetStatus
      netWorth: string | null
      totalAssets: string
      totalLiabilities: string | null
      issues: FinanceBalanceSheetIssue[]
      accounts: FinanceAccount[]
      cards: FinanceCard[]
      loans: FinanceLoan[]
      /** Cash summary, only set for the system Efectivo institution. */
      cash: FinanceCashSummary | null
      currencyTotals: FinanceBalanceSheetCurrencySlice[]
      irregularities: InstitutionIrregularities
    }
  | {
      kind: "cash"
      id: string
      account: FinanceAccount
      balance: string
      currencyTotals: FinanceBalanceSheetCurrencySlice[]
      irregularities: InstitutionIrregularities
    }

export type InstitutionBalancePosition = {
  institutionId: string
  status: FinanceBalanceSheetStatus
  netWorth: string | null
  totalAssets: string
  totalLiabilities: string | null
  byCurrency?: FinanceBalanceSheetCurrencySlice[]
  issues: FinanceBalanceSheetIssue[]
}

/** Native balance lines for a card or detail hero; empty when a limit is missing. */
export function institutionBalanceLines({
  item,
  display,
}: {
  item: InstitutionStackItem
  display: FinanceMoneyDisplay
}): Array<{ currency: string; amount: string }> {
  const hasMissingCreditLimit =
    item.kind === "institution" &&
    item.issues.some((issue) => issue.code === "MISSING_CREDIT_LIMIT")
  if (hasMissingCreditLimit) {
    return []
  }
  return item.currencyTotals.map((total) => ({
    currency: total.currency,
    amount: formatFinanceMoney(total.netWorth, {
      ...display,
      currency: total.currency,
    }),
  }))
}

export function institutionInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return "?"
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase()
  }
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase()
}

export function formatProductCounts(counts: InstitutionStackCounts): string {
  return `${counts.accounts} cuentas · ${counts.cards} tarjetas · ${counts.loans} préstamos`
}

export function formatStackItemBalance(
  item: InstitutionStackItem,
  display: FinanceMoneyDisplay
): string {
  if (item.kind === "cash") {
    return formatFinanceMoney(item.balance, {
      ...display,
      currency: item.account.currency,
    })
  }
  if (item.cash) {
    if (item.cash.status !== "COMPLETE" || item.cash.totalBase === null) {
      return "Balance incompleto"
    }
    return formatFinanceMoney(item.cash.totalBase, display)
  }
  if (item.status !== "COMPLETE" || item.netWorth === null) {
    return "Balance incompleto"
  }
  return formatFinanceMoney(item.netWorth, display)
}

function hasDriftForProduct(
  drifts: readonly FinanceBalanceDrift[],
  target: { accountId?: string | null; cardId?: string | null }
): boolean {
  return drifts.some(
    (drift) =>
      (target.accountId !== undefined &&
        target.accountId !== null &&
        drift.accountId === target.accountId) ||
      (target.cardId !== undefined &&
        target.cardId !== null &&
        drift.cardId === target.cardId)
  )
}

function hasPendingReconciliationForProduct(
  reconciliationItems: readonly FinanceReconciliationStatusItem[],
  target: { accountId?: string | null; cardId?: string | null }
): boolean {
  return reconciliationItems.some(
    (item) =>
      !item.reconciled &&
      ((target.accountId !== undefined &&
        target.accountId !== null &&
        item.accountId === target.accountId) ||
        (target.cardId !== undefined &&
          target.cardId !== null &&
          item.cardId === target.cardId))
  )
}

export function buildInstitutionStackItems(input: {
  institutions: FinanceInstitution[]
  accounts: FinanceAccount[]
  cards: FinanceCard[]
  loans: FinanceLoan[]
  positions?: InstitutionBalancePosition[]
  cash?: FinanceCashSummary
  drifts?: readonly FinanceBalanceDrift[]
  reconciliationItems?: readonly FinanceReconciliationStatusItem[]
}): InstitutionStackItem[] {
  const activeInstitutions = input.institutions.filter((item) => item.isActive)
  const activeAccounts = input.accounts.filter((item) => item.isActive)
  const activeCards = input.cards.filter((item) => item.isActive)
  const activeLoans = input.loans.filter((item) => item.isActive)
  const positionsById = new Map(
    (input.positions ?? []).map((position) => [
      position.institutionId,
      position,
    ])
  )

  const institutionItems: InstitutionStackItem[] = activeInstitutions.map(
    (institution) => {
      const accounts = activeAccounts.filter(
        (account) => account.institutionId === institution.id
      )
      const cards = activeCards.filter(
        (card) => card.institutionId === institution.id
      )
      const loans = activeLoans.filter(
        (loan) => loan.institutionId === institution.id
      )
      const position = positionsById.get(institution.id)
      const irregularities = {
        drift:
          accounts.some((account) =>
            hasDriftForProduct(input.drifts ?? [], {
              accountId: account.id,
            })
          ) ||
          cards.some((card) =>
            hasDriftForProduct(input.drifts ?? [], { cardId: card.id })
          ),
        reconciliation:
          accounts.some((account) =>
            hasPendingReconciliationForProduct(
              input.reconciliationItems ?? [],
              { accountId: account.id }
            )
          ) ||
          cards.some((card) =>
            hasPendingReconciliationForProduct(
              input.reconciliationItems ?? [],
              { cardId: card.id }
            )
          ),
      }
      return {
        kind: "institution",
        id: institution.id,
        institution,
        accounts,
        cards,
        loans,
        counts: {
          accounts: accounts.length,
          cards: cards.length,
          loans: loans.length,
        },
        status: position?.status ?? "INCOMPLETE",
        netWorth: position?.netWorth ?? null,
        totalAssets: position?.totalAssets ?? "0",
        totalLiabilities: position?.totalLiabilities ?? null,
        issues: position?.issues ?? [],
        cash: isCashInstitution(institution) ? (input.cash ?? null) : null,
        currencyTotals: position?.byCurrency ?? [],
        irregularities,
      }
    }
  )

  const cashItems: InstitutionStackItem[] = activeAccounts
    .filter((account) => account.type === "CASH" && !account.institutionId)
    .map((account) => ({
      kind: "cash" as const,
      id: account.id,
      account,
      balance: account.balance,
      currencyTotals: [
        {
          currency: account.currency,
          assets: account.balance,
          available: account.balance,
          receivables: "0",
          liabilities: "0",
          netWorth: account.balance,
        },
      ],
      irregularities: {
        drift: hasDriftForProduct(input.drifts ?? [], {
          accountId: account.id,
        }),
        reconciliation: hasPendingReconciliationForProduct(
          input.reconciliationItems ?? [],
          { accountId: account.id }
        ),
      },
    }))

  return [...institutionItems, ...cashItems]
}

export function findInstitutionStackItem(
  items: InstitutionStackItem[],
  institutionId: string
): Extract<InstitutionStackItem, { kind: "institution" }> | null {
  const match = items.find(
    (item) => item.kind === "institution" && item.id === institutionId
  )
  return match?.kind === "institution" ? match : null
}
