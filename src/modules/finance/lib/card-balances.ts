import type {
  FinanceAccount,
  FinanceCard,
  FinanceCardBalance,
} from "../types/entities.ts"

export type FinanceCardDisplayBalance = Pick<
  FinanceCardBalance,
  "id" | "currency" | "balance"
> & {
  creditLimit?: string | null
}

export function resolveCardDisplayBalances(
  card: FinanceCard,
  accounts: readonly FinanceAccount[],
): FinanceCardDisplayBalance[] {
  if (card.type === "CREDIT") {
    return card.balances
  }

  const account = accounts.find((item) => item.id === card.accountId)
  return account
    ? [
        {
          id: account.id,
          currency: account.currency,
          balance: account.balance,
        },
      ]
    : []
}

export function canManageCardBalances(card: FinanceCard): boolean {
  return card.type === "CREDIT"
}
