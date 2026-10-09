import { formatFinanceMoney, type FinanceMoneyDisplay } from "./money.ts"
import type {
  FinanceAccount,
  FinanceBalanceSheetIssue,
  FinanceBalanceSheetStatus,
  FinanceCard,
  FinanceInstitution,
  FinanceLoan,
} from "../types/entities.ts"

export type InstitutionStackCounts = {
  accounts: number
  cards: number
  loans: number
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
    }
  | {
      kind: "cash"
      id: string
      account: FinanceAccount
      balance: string
    }

export type InstitutionBalancePosition = {
  institutionId: string
  status: FinanceBalanceSheetStatus
  netWorth: string | null
  totalAssets: string
  totalLiabilities: string | null
  issues: FinanceBalanceSheetIssue[]
}

export function institutionInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
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
  if (item.status !== "COMPLETE" || item.netWorth === null) {
    return "Balance incompleto"
  }
  return formatFinanceMoney(item.netWorth, display)
}

export function buildInstitutionStackItems(input: {
  institutions: FinanceInstitution[]
  accounts: FinanceAccount[]
  cards: FinanceCard[]
  loans: FinanceLoan[]
  positions?: InstitutionBalancePosition[]
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
