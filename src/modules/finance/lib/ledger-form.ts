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

export function formatCalendarDate(value: string): string {
  const slice = value.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(slice)) {
    return value
  }
  const year = Number(slice.slice(0, 4))
  const month = Number(slice.slice(5, 7))
  const day = Number(slice.slice(8, 10))
  const date = new Date(year, month - 1, day)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleDateString("es", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
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
