import type {
  FinanceAccount,
  FinanceCard,
  FinanceInstitution,
} from "../types/entities.ts"

export type DestinationPickerGroup =
  | {
      kind: "institution"
      id: string
      name: string
      logoUrl: string | null
      accounts: FinanceAccount[]
      cards: FinanceCard[]
    }
  | {
      kind: "cash"
      id: string
      account: FinanceAccount
    }

/**
 * Institutions that have at least one active account or card, plus loose cash
 * accounts (CASH and no institution). Loans are not part of this picker.
 */
export function buildDestinationPickerGroups(input: {
  institutions: FinanceInstitution[]
  accounts: FinanceAccount[]
  cards: FinanceCard[]
}): DestinationPickerGroup[] {
  const activeAccounts = input.accounts.filter((account) => account.isActive)
  const activeCards = input.cards.filter((card) => card.isActive)
  const groups: DestinationPickerGroup[] = []

  for (const institution of input.institutions) {
    if (!institution.isActive) continue
    const accounts = activeAccounts.filter(
      (account) => account.institutionId === institution.id,
    )
    const cards = activeCards.filter(
      (card) => card.institutionId === institution.id,
    )
    if (accounts.length === 0 && cards.length === 0) continue
    groups.push({
      kind: "institution",
      id: institution.id,
      name: institution.name,
      logoUrl: institution.logoUrl,
      accounts,
      cards,
    })
  }

  for (const account of activeAccounts) {
    if (account.type === "CASH" && !account.institutionId) {
      groups.push({ kind: "cash", id: account.id, account })
    }
  }

  return groups
}
