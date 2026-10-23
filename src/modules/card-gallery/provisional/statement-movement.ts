import type { FinanceTransactionStatus } from "@/src/modules/finance/shared/types/entities"
import type { FinanceTransactionType } from "@/src/modules/finance/shared/types/entities"
import type {
  FinanceCard,
  FinanceCardStatementMovement,
  FinanceTransaction,
} from "@/src/modules/finance/shared/types/entities"

type StatementMovementInput = {
  movement: FinanceCardStatementMovement
  card: FinanceCard
}

function parseStatementType(type: string): FinanceTransactionType {
  switch (type) {
    case "DEBIT":
    case "CREDIT":
    case "TRANSFER":
    case "ADJUSTMENT":
      return type
    default:
      throw new Error(`Unknown statement movement type: ${type}`)
  }
}

function parseStatementStatus(status: string): FinanceTransactionStatus {
  switch (status) {
    case "PENDING":
    case "CONFIRMED":
    case "DECLINED":
    case "CANCELLED":
    case "REVERSED":
      return status
    default:
      throw new Error(`Unknown statement movement status: ${status}`)
  }
}

/**
 * PROVISIONAL (#272): proposal of the adapter that feeds a statement row with
 * the shared movement row (#282, #284). The statement model has no category
 * and no base amount yet; the gallery only paints it. Delete in #290.
 */
export function statementMovementToTransaction({
  movement,
  card,
}: StatementMovementInput): FinanceTransaction {
  return {
    id: movement.id,
    type: parseStatementType(movement.type),
    status: parseStatementStatus(movement.status),
    editable: "NONE",
    amount: movement.amount,
    currency: movement.currency,
    ledgerAmount: movement.ledgerAmount,
    ledgerCurrency: movement.ledgerCurrency,
    amountBaseCurrency: movement.ledgerAmount,
    exchangeRate: null,
    accountId: card.accountId,
    accountName: card.accountName,
    institutionLogoUrl: card.institutionLogoUrl ?? null,
    cardId: card.id,
    cardName: card.name,
    network: card.network,
    networkLogoUrl: card.networkLogoUrl ?? null,
    categoryId: null,
    merchant: movement.merchant,
    merchantId: null,
    merchantName: movement.merchant,
    merchantLogoUrl: null,
    notes: null,
    source: "STATEMENT",
    transactionDate: movement.transactionDate,
    description: movement.description,
    transferGroupId: movement.transferGroupId,
    transferToAccountId: null,
    transferToAccountName: null,
    transferToCardId: null,
    transferToCardName: null,
    kind: "TRANSACTION",
  }
}
