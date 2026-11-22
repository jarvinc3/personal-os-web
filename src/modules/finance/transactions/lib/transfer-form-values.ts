import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import { sliceDateTimeInput } from "@/src/modules/finance/shared/lib/ledger-form"
import { encodeLedgerTarget } from "@/src/modules/finance/shared/lib/ledger-payloads"
import type { FinanceTransaction } from "@/src/modules/finance/shared/types/entities"
import type { TransferFormValues } from "@/src/modules/finance/transactions/lib/transfer-form"

/** Destino del ledger canónico: la cuenta manda y la tarjeta es la alternativa. */
function transferLedgerTarget(
  accountId: string | null | undefined,
  cardId: string | null | undefined
): string {
  if (accountId) {
    return encodeLedgerTarget("account", accountId)
  }
  if (cardId) {
    return encodeLedgerTarget("card", cardId)
  }
  return CATALOG_NONE
}

export function transferDefaults(
  transfer: FinanceTransaction | null,
  defaultCurrency: string
): TransferFormValues {
  return {
    amount: transfer?.amount ?? "",
    currency: transfer?.currency ?? defaultCurrency,
    transactionDate: sliceDateTimeInput(transfer?.transactionDate),
    fromTarget: transferLedgerTarget(transfer?.accountId, transfer?.cardId),
    toTarget: transferLedgerTarget(
      transfer?.transferToAccountId,
      transfer?.transferToCardId
    ),
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
