import { parseFinanceMoney } from "./money.ts"
import type {
  FinanceAccount,
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
      consolidatedBalance: number
      accounts: FinanceAccount[]
      cards: FinanceCard[]
      loans: FinanceLoan[]
    }
  | {
      kind: "cash"
      id: string
      account: FinanceAccount
      consolidatedBalance: number
    }

function sumBalances(values: Array<string | null | undefined>): number {
  return values.reduce((total, value) => {
    const parsed = parseFinanceMoney(value)
    return total + (parsed ?? 0)
  }, 0)
}

export function institutionInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase()
  }
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase()
}

export function formatProductCounts(counts: InstitutionStackCounts): string {
  return `${counts.accounts} cuentas · ${counts.cards} tarjetas · ${counts.loans} préstamos`
}

export function computeInstitutionConsolidatedBalance(input: {
  accounts: FinanceAccount[]
  cards: FinanceCard[]
  loans: FinanceLoan[]
}): number {
  const accountTotal = sumBalances(input.accounts.map((item) => item.balance))
  const creditDebt = sumBalances(
    input.cards
      .filter((card) => card.type === "CREDIT")
      .flatMap((card) => card.balances.map((balance) => balance.balance)),
  )
  const loanDebt = sumBalances(input.loans.map((loan) => loan.currentBalance))
  return accountTotal - creditDebt - loanDebt
}

export function buildInstitutionStackItems(input: {
  institutions: FinanceInstitution[]
  accounts: FinanceAccount[]
  cards: FinanceCard[]
  loans: FinanceLoan[]
}): InstitutionStackItem[] {
  const activeInstitutions = input.institutions.filter((item) => item.isActive)
  const activeAccounts = input.accounts.filter((item) => item.isActive)
  const activeCards = input.cards.filter((item) => item.isActive)
  const activeLoans = input.loans.filter((item) => item.isActive)

  const institutionItems: InstitutionStackItem[] = activeInstitutions.map(
    (institution) => {
      const accounts = activeAccounts.filter(
        (account) => account.institutionId === institution.id,
      )
      const cards = activeCards.filter(
        (card) => card.institutionId === institution.id,
      )
      const loans = activeLoans.filter(
        (loan) => loan.institutionId === institution.id,
      )
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
        consolidatedBalance: computeInstitutionConsolidatedBalance({
          accounts,
          cards,
          loans,
        }),
      }
    },
  )

  const cashItems: InstitutionStackItem[] = activeAccounts
    .filter((account) => account.type === "CASH" && !account.institutionId)
    .map((account) => ({
      kind: "cash" as const,
      id: account.id,
      account,
      consolidatedBalance: parseFinanceMoney(account.balance) ?? 0,
    }))

  return [...institutionItems, ...cashItems]
}

export function findInstitutionStackItem(
  items: InstitutionStackItem[],
  institutionId: string,
): Extract<InstitutionStackItem, { kind: "institution" }> | null {
  const match = items.find(
    (item) => item.kind === "institution" && item.id === institutionId,
  )
  return match?.kind === "institution" ? match : null
}
