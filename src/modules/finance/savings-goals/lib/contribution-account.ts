import { parseFinanceMoney } from "@/src/modules/finance/shared/lib/money.ts"
import type { FinanceAccount } from "@/src/modules/finance/shared/types/entities"

function hasFreeBalance(account: FinanceAccount): boolean {
  return (parseFinanceMoney(account.freeBalance) ?? 0) > 0
}

/**
 * Account a contribution comes from: the goal's own account while it has free
 * balance, and otherwise the first funded account, so the sheet never proposes
 * an account that will be rejected on submit.
 */
export function defaultContributionAccountId(input: {
  accounts: readonly FinanceAccount[]
  goalAccountId: string | null
}): string {
  const { accounts, goalAccountId } = input
  const goalAccount =
    accounts.find((account) => account.id === goalAccountId) ?? null
  if (goalAccount && hasFreeBalance(goalAccount)) {
    return goalAccount.id
  }
  return accounts.find(hasFreeBalance)?.id ?? accounts[0]?.id ?? ""
}
