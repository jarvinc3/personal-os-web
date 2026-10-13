import type { FinanceTransaction } from "@/src/modules/finance/shared/types/entities"

type EditableTransaction = Pick<FinanceTransaction, "editable">

export function canEditTransaction(transaction: EditableTransaction): boolean {
  return transaction.editable === "FULL" || transaction.editable === "METADATA"
}

export function canUnlockTransaction(
  transaction: EditableTransaction
): boolean {
  return transaction.editable === "METADATA"
}

export function isTransactionMetadataOnly(
  transaction: EditableTransaction
): boolean {
  return transaction.editable === "METADATA"
}

export function isTransactionReadOnly(
  transaction: EditableTransaction
): boolean {
  return transaction.editable === "NOTES" || transaction.editable === "NONE"
}
