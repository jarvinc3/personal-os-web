import type {
  FinanceTransaction,
  FinanceTransactionStatus,
} from "@/src/modules/finance/shared/types/entities"

export function canReverseTransaction(
  tx: Pick<FinanceTransaction, "status">
): boolean {
  return tx.status === "CONFIRMED"
}

export function isTransferTransaction(
  item: Pick<FinanceTransaction, "type" | "transferGroupId">
): boolean {
  return item.type === "TRANSFER" || Boolean(item.transferGroupId)
}

const NON_COUNTING_STATUSES: ReadonlySet<FinanceTransactionStatus> = new Set([
  "REVERSED",
  "CANCELLED",
  "DECLINED",
])

/** Reversed, cancelled and declined movements never add to a total. */
export function isInactiveTransactionStatus(
  status: FinanceTransactionStatus
): boolean {
  return NON_COUNTING_STATUSES.has(status)
}

export function transactionInstrumentLabel(
  item: Pick<FinanceTransaction, "accountName" | "cardName">
): string | null {
  return item.cardName ?? item.accountName
}

export function transferDirectionLabel(
  item: Pick<
    FinanceTransaction,
    "accountName" | "cardName" | "transferToAccountName" | "transferToCardName"
  >
): string {
  const origin = item.accountName ?? item.cardName ?? "Origen"
  const destination =
    item.transferToAccountName ?? item.transferToCardName ?? "Destino"
  return `${origin} → ${destination}`
}
