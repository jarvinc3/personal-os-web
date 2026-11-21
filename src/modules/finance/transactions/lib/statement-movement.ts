import type {
  FinanceCardStatementMovement,
  FinanceStatementImportExtra,
  FinanceTransactionType,
} from "@/src/modules/finance/shared/types/entities"
import { parseFinanceMoney } from "@/src/modules/finance/shared/lib/money"

/** Data the statement row paints; a bank line is not an entity of the app. */
export type StatementMovementRowModel = {
  title: string
  date: string
  /** Null when neither the ledger nor the original amount can be read. */
  amount: string | null
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

type StatementMoney = {
  amount: string | null
  currency: string
}

function readableMoney(
  amount: string | null | undefined,
  currency: string | null | undefined
): StatementMoney | null {
  if (amount === null || amount === undefined) {
    return null
  }
  if (parseFinanceMoney(amount) === null || !currency?.trim()) {
    return null
  }
  return { amount, currency }
}

/**
 * The ledger amount is the one the card owes; a line without it still shows its
 * original amount instead of a stray sign over a dash.
 */
function statementRowMoney(
  movement: FinanceCardStatementMovement
): StatementMoney {
  return (
    readableMoney(movement.ledgerAmount, movement.ledgerCurrency) ??
    readableMoney(movement.amount, movement.currency) ?? {
      amount: null,
      currency: movement.currency,
    }
  )
}

/** One line of a card statement as the canonical movement row (#284). */
export function fromStatementLine(
  movement: FinanceCardStatementMovement
): StatementMovementRowModel {
  const money = statementRowMoney(movement)
  return {
    title: statementTitle(movement),
    date: movement.transactionDate,
    amount: money.amount,
    currency: money.currency,
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
