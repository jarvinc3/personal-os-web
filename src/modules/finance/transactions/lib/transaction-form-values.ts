import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import { sliceDateTimeInput } from "@/src/modules/finance/shared/lib/ledger-form"
import { encodeLedgerTarget } from "@/src/modules/finance/shared/lib/ledger-payloads"
import type { FinanceTransaction } from "@/src/modules/finance/shared/types/entities"
import type { TransactionPrefill } from "@/src/modules/finance/transactions/lib/transaction-prefill"
import type { TransactionFormValues } from "@/src/modules/finance/transactions/lib/transaction-form"

export type MovementType = TransactionFormValues["type"]

export function destinationFromTransaction(
  transaction: FinanceTransaction | null
): string {
  if (transaction?.cardId) {
    return encodeLedgerTarget("card", transaction.cardId)
  }
  if (transaction?.accountId) {
    return encodeLedgerTarget("account", transaction.accountId)
  }
  return CATALOG_NONE
}

export function movementTypeForTransaction(
  transaction: FinanceTransaction | null,
  initialType: MovementType
): MovementType {
  if (!transaction) {
    return initialType
  }
  return transaction.type === "CREDIT" ? "CREDIT" : "DEBIT"
}

type ToFormValuesInput = {
  transaction: FinanceTransaction | null
  initialType: MovementType
  defaultCurrency: string
  defaultDestination: string
  prefill: TransactionPrefill
}

export function toFormValues({
  transaction,
  initialType,
  defaultCurrency,
  defaultDestination,
  prefill,
}: ToFormValuesInput): TransactionFormValues {
  return {
    type: movementTypeForTransaction(transaction, initialType),
    amount: transaction?.amount ?? prefill.amount,
    currency: transaction?.currency ?? (prefill.currency || defaultCurrency),
    transactionDate: transaction
      ? sliceDateTimeInput(transaction.transactionDate)
      : sliceDateTimeInput(prefill.transactionDate),
    destination: transaction
      ? destinationFromTransaction(transaction)
      : defaultDestination,
    categoryId: transaction?.categoryId ?? (prefill.categoryId || CATALOG_NONE),
    status: transaction?.status === "PENDING" ? "PENDING" : "CONFIRMED",
    merchant: transaction?.merchant ?? prefill.merchant,
    description: transaction?.description ?? prefill.description,
    notes: transaction?.notes ?? "",
  }
}
