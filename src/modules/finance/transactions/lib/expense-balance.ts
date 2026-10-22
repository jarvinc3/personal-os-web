import type { FinanceAccountType } from "@/src/modules/finance/shared/constants/catalog"
import { parseFinanceMoney } from "@/src/modules/finance/shared/lib/money"

export type ExpenseBalanceVerdict =
  | { status: "ok" }
  | { status: "confirm"; projectedBalance: number }
  | { status: "blocked"; projectedBalance: number }

type ExpenseBalanceInput = {
  accountType: FinanceAccountType
  balance: string
  amount: string
  accountCurrency: string
  transactionCurrency: string
}

/**
 * Compares an expense with the account balance before saving it. Cash accounts
 * never go negative; a bank account asks for confirmation instead.
 */
export function assessExpenseBalance({
  accountType,
  balance,
  amount,
  accountCurrency,
  transactionCurrency,
}: ExpenseBalanceInput): ExpenseBalanceVerdict {
  if (
    accountCurrency.trim().toUpperCase() !==
    transactionCurrency.trim().toUpperCase()
  ) {
    // The ledger converts the amount on the server, so this screen cannot know
    // the exact balance impact. The API remains the source of truth.
    return { status: "ok" }
  }

  const currentBalance = parseFinanceMoney(balance)
  const expenseAmount = parseFinanceMoney(amount)
  if (currentBalance === null || expenseAmount === null) {
    return { status: "ok" }
  }

  const projectedBalance = currentBalance - expenseAmount
  if (projectedBalance >= 0) {
    return { status: "ok" }
  }

  return accountType === "CASH"
    ? { status: "blocked", projectedBalance }
    : { status: "confirm", projectedBalance }
}
