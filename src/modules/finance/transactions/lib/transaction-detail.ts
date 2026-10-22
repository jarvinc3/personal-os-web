import { FINANCE_TRANSACTION_TYPE_LABEL } from "@/src/modules/finance/shared/types/entities"
import type {
  FinanceTransaction,
  FinanceTransactionType,
} from "@/src/modules/finance/shared/types/entities"

import { canUnlockTransaction } from "./transaction-edit.ts"

export function transactionTypeLabel(type: string): string {
  if (type in FINANCE_TRANSACTION_TYPE_LABEL) {
    return FINANCE_TRANSACTION_TYPE_LABEL[type as FinanceTransactionType]
  }
  return type
}

export function canConfirmTransaction(
  transaction: FinanceTransaction
): boolean {
  return transaction.status === "PENDING"
}

export function canUnlockConfirmedTransaction(
  transaction: FinanceTransaction
): boolean {
  return canUnlockTransaction(transaction)
}
