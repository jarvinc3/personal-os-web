import { CATALOG_NONE } from "../constants/catalog.ts"
import { encodeLedgerTarget, splitLedgerTarget } from "./ledger-payloads.ts"
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
    if (!institution.isActive) {
      continue
    }
    const accounts = activeAccounts.filter(
      (account) => account.institutionId === institution.id
    )
    const cards = activeCards.filter(
      (card) => card.institutionId === institution.id
    )
    if (accounts.length === 0 && cards.length === 0) {
      continue
    }
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

/**
 * Todas las cuentas y tarjetas que se pueden elegir como destino. El efectivo
 * va primero: es la opción más probable para un movimiento nuevo.
 */
export function ledgerTargetsFromGroups(
  groups: DestinationPickerGroup[]
): string[] {
  const targets: string[] = []

  for (const group of groups) {
    if (group.kind === "cash") {
      targets.push(encodeLedgerTarget("account", group.account.id))
    }
  }

  for (const group of groups) {
    if (group.kind !== "institution") {
      continue
    }
    for (const account of group.accounts) {
      targets.push(encodeLedgerTarget("account", account.id))
    }
    for (const card of group.cards) {
      targets.push(encodeLedgerTarget("card", card.id))
    }
  }

  return targets
}

export function firstLedgerTarget(groups: DestinationPickerGroup[]): string {
  const [first] = ledgerTargetsFromGroups(groups)
  return first ?? CATALOG_NONE
}

export function isKnownLedgerTarget(
  destination: string,
  accounts: FinanceAccount[],
  cards: FinanceCard[]
): boolean {
  const target = splitLedgerTarget(destination)
  if (target.accountId) {
    return accounts.some((account) => account.id === target.accountId)
  }
  if (target.cardId) {
    return cards.some((card) => card.id === target.cardId)
  }
  return false
}
