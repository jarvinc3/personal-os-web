import type { FinanceAccount, FinanceCard } from "@/src/modules/finance/types/entities"
import { splitLedgerTarget } from "./ledger-payloads.ts"

export function todayDateInput(now = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${now.getFullYear()}-${month}-${day}`
}

export function sliceDateInput(
  value: string | undefined,
  fallback = todayDateInput(),
): string {
  if (!value) return fallback
  return value.slice(0, 10)
}

export function currencyForTarget(
  destination: string,
  accounts: FinanceAccount[],
  cards: FinanceCard[],
  fallback: string,
): string {
  const target = splitLedgerTarget(destination)
  const account = accounts.find((item) => item.id === target.accountId)
  if (account?.currency) return account.currency
  const card = cards.find((item) => item.id === target.cardId)
  const cardCurrency = card?.balances[0]?.currency
  if (cardCurrency) return cardCurrency
  return fallback
}

export function ledgerTargetLabel(
  destination: string,
  accounts: FinanceAccount[],
  cards: FinanceCard[],
): string | null {
  const target = splitLedgerTarget(destination)
  const account = accounts.find((item) => item.id === target.accountId)
  if (account) return account.name
  const card = cards.find((item) => item.id === target.cardId)
  if (card) return card.name
  return null
}
