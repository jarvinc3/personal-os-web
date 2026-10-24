import type {
  FinanceCardStatementMovement,
  FinanceStatementImportExtra,
  FinanceTransactionType,
} from "@/src/modules/finance/shared/types/entities"

/** Data the statement row paints; a bank line is not an entity of the app. */
export type StatementMovementRowModel = {
  title: string
  date: string
  amount: string
  currency: string
  type: FinanceTransactionType
}

function statementType(type: string): FinanceTransactionType {
  switch (type) {
    case "DEBIT":
    case "CREDIT":
    case "TRANSFER":
    case "ADJUSTMENT":
      return type
    // The app has no card-payment type: the row reads it as a transfer.
    case "CARD_PAYMENT":
      return "TRANSFER"
    default:
      throw new Error(`Unknown statement movement type: ${type}`)
  }
}

function statementTitle(movement: {
  merchant: string | null
  description: string | null
}): string {
  return movement.merchant ?? movement.description ?? "Movimiento"
}

/** One line of a card statement as the canonical movement row (#284). */
export function fromStatementLine(
  movement: FinanceCardStatementMovement
): StatementMovementRowModel {
  return {
    title: statementTitle(movement),
    date: movement.transactionDate,
    amount: movement.ledgerAmount,
    currency: movement.ledgerCurrency,
    type: statementType(movement.type),
  }
}

/** An app movement missing from the imported statement, as the same row (#284). */
export function fromStatementImportExtra(
  movement: FinanceStatementImportExtra
): StatementMovementRowModel {
  return {
    title: statementTitle(movement),
    date: movement.date,
    amount: movement.amount,
    currency: movement.currency,
    type: statementType(movement.type),
  }
}
