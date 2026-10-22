import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import { sliceDateTimeInput } from "@/src/modules/finance/shared/lib/ledger-form"
import { encodeLedgerTarget } from "@/src/modules/finance/shared/lib/ledger-payloads"
import type { FinanceTransaction } from "@/src/modules/finance/shared/types/entities"
import type { TransferFormValues } from "@/src/modules/finance/transactions/lib/transfer-form"

export function transferDefaults(
  transfer: FinanceTransaction | null,
  defaultCurrency: string
): TransferFormValues {
  return {
    amount: transfer?.amount ?? "",
    currency: transfer?.currency ?? defaultCurrency,
    transactionDate: sliceDateTimeInput(transfer?.transactionDate),
    fromTarget: transfer?.accountId
      ? encodeLedgerTarget("account", transfer.accountId)
      : transfer?.cardId
        ? encodeLedgerTarget("card", transfer.cardId)
        : CATALOG_NONE,
    toTarget: transfer?.transferToAccountId
      ? encodeLedgerTarget("account", transfer.transferToAccountId)
      : transfer?.transferToCardId
        ? encodeLedgerTarget("card", transfer.transferToCardId)
        : CATALOG_NONE,
    status: transfer?.status === "PENDING" ? "PENDING" : "CONFIRMED",
    destinationPending: false,
    rail: "",
    feeAmount: "",
    exchangeRate:
      transfer && !transfer.transferEstimated
        ? (transfer.exchangeRate ?? "")
        : "",
    receivedAmount:
      transfer && !transfer.transferEstimated
        ? (transfer.transferToAmount ?? "")
        : "",
    description: transfer?.description ?? "",
    notes: transfer?.notes ?? "",
  }
}
