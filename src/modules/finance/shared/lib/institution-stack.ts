import { countLabel } from "./count-label.ts"
import { formatFinanceMoney, type FinanceMoneyDisplay } from "./money.ts"
import { isCashInstitution } from "./cash.ts"
import {
  accountIrregularities,
  productIrregularities,
} from "./institution-irregularities.ts"
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
  return [
    countLabel(counts.accounts, "account"),
    countLabel(counts.cards, "card"),
    countLabel(counts.loans, "loan"),
  ].join(" · ")
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

type InstitutionStackInput = {
  institutions: FinanceInstitution[]
  accounts: FinanceAccount[]
  cards: FinanceCard[]
  loans: FinanceLoan[]
  positions?: InstitutionBalancePosition[]
  cash?: FinanceCashSummary
  drifts?: readonly FinanceBalanceDrift[]
  reconciliationItems?: readonly FinanceReconciliationStatusItem[]
}

type InstitutionProducts = {
  accounts: FinanceAccount[]
  cards: FinanceCard[]
  loans: FinanceLoan[]
}

function productGroups(
  input: {
    accounts: FinanceAccount[]
    cards: FinanceCard[]
    loans: FinanceLoan[]
  },
  institutionId: string
): InstitutionProducts {
  return {
    accounts: input.accounts.filter(
      (account) => account.institutionId === institutionId
    ),
    cards: input.cards.filter((card) => card.institutionId === institutionId),
    loans: input.loans.filter((loan) => loan.institutionId === institutionId),
  }
}

type PositionFields = {
  status: FinanceBalanceSheetStatus
  netWorth: string | null
  totalAssets: string
  totalLiabilities: string | null
  issues: FinanceBalanceSheetIssue[]
  currencyTotals: FinanceBalanceSheetCurrencySlice[]
}

const EMPTY_POSITION: PositionFields = {
  status: "INCOMPLETE",
  netWorth: null,
  totalAssets: "0",
  totalLiabilities: null,
  issues: [],
  currencyTotals: [],
}

function positionFields(
  position: InstitutionBalancePosition | undefined
): PositionFields {
  if (!position) {
    return EMPTY_POSITION
  }
  return {
    status: position.status,
    netWorth: position.netWorth,
    totalAssets: position.totalAssets,
    totalLiabilities: position.totalLiabilities,
    issues: position.issues,
    currencyTotals: position.byCurrency ?? [],
  }
}

function institutionStackItem(input: {
  stack: InstitutionStackInput
  institution: FinanceInstitution
  products: InstitutionProducts
  position: InstitutionBalancePosition | undefined
}): Extract<InstitutionStackItem, { kind: "institution" }> {
  return {
    kind: "institution",
    id: input.institution.id,
    institution: input.institution,
    accounts: input.products.accounts,
    cards: input.products.cards,
    loans: input.products.loans,
    counts: {
      accounts: input.products.accounts.length,
      cards: input.products.cards.length,
      loans: input.products.loans.length,
    },
    ...positionFields(input.position),
    cash: isCashInstitution(input.institution)
      ? (input.stack.cash ?? null)
      : null,
    irregularities: productIrregularities(input.stack, input.products),
  }
}

function cashStackItem(
  input: InstitutionStackInput,
  account: FinanceAccount
): Extract<InstitutionStackItem, { kind: "cash" }> {
  return {
    kind: "cash",
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
    irregularities: accountIrregularities(input, account),
  }
}

export function buildInstitutionStackItems(
  input: InstitutionStackInput
): InstitutionStackItem[] {
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

  const institutionItems = activeInstitutions.map((institution) =>
    institutionStackItem({
      stack: input,
      institution,
      products: productGroups(
        { accounts: activeAccounts, cards: activeCards, loans: activeLoans },
        institution.id
      ),
      position: positionsById.get(institution.id),
    })
  )
  const cashItems = activeAccounts
    .filter((account) => account.type === "CASH" && !account.institutionId)
    .map((account) => cashStackItem(input, account))

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
