import type { FinanceTransaction } from "@/src/modules/finance/shared/types/entities"
import {
  parseFinanceMoney,
  signedFinanceMoney,
  type FinanceMoneyDisplay,
} from "./money.ts"
import { isTransferTransaction } from "./transactions-predicates.ts"

export const OPERATION_LEG_ROLE = {
  SOURCE: "SOURCE",
  DESTINATION: "DESTINATION",
  FEE: "FEE",
} as const

export type FinanceInstrumentRef = { accountId?: string; cardId?: string }

export function movementSign(
  transaction: Pick<FinanceTransaction, "type" | "ledgerAmount">
): "+" | "−" | null {
  if (transaction.type === "DEBIT") {
    return "−"
  }
  if (transaction.type === "CREDIT") {
    return "+"
  }
  if (transaction.type === "ADJUSTMENT") {
    const ledger = parseFinanceMoney(transaction.ledgerAmount)
    if (ledger !== null && ledger < 0) {
      return "−"
    }
    return "+"
  }
  return null
}

/**
 * Money a movement shows on the instrument it is read from. A cross-currency
 * transfer credits the destination with the received amount, not the source one.
 */
export function movementSideMoney(
  transaction: FinanceTransaction,
  instrument?: FinanceInstrumentRef
): { amount: string; currency: string } {
  const sourceSide = {
    amount: transaction.amount,
    currency: transaction.currency,
  }
  if (!instrument || !transaction.transferToAmount) {
    return sourceSide
  }
  if (!transaction.transferToCurrency) {
    return sourceSide
  }
  if (transferSignFromInstrument(transaction, instrument) !== "+") {
    return sourceSide
  }
  return {
    amount: transaction.transferToAmount,
    currency: transaction.transferToCurrency,
  }
}

export function signedMoneyLabel({
  amount,
  currency,
  display,
  sign,
}: {
  amount: string
  currency: string
  display: FinanceMoneyDisplay
  sign: "+" | "−" | null
}): string {
  return signedFinanceMoney(amount, { ...display, currency }, sign)
}

export function signedAmount({
  transaction,
  display,
  instrument,
}: {
  transaction: FinanceTransaction
  display: FinanceMoneyDisplay
  instrument?: FinanceInstrumentRef
}): string {
  const side = movementSideMoney(transaction, instrument)
  return signedMoneyLabel({
    amount: side.amount,
    currency: side.currency,
    display,
    sign: displayedMovementSign(transaction, instrument),
  })
}

/** Sign of a row: a transfer depends on the account or card it is read from. */
export function displayedMovementSign(
  transaction: FinanceTransaction,
  instrument?: FinanceInstrumentRef
): "+" | "−" | null {
  if (!isTransferTransaction(transaction)) {
    return movementSign(transaction)
  }
  if (!instrument) {
    return null
  }
  return transferSignFromInstrument(transaction, instrument)
}

function legMatchesInstrument(
  leg: FinanceTransaction,
  instrument: FinanceInstrumentRef
): boolean {
  if (instrument.accountId) {
    return leg.accountId === instrument.accountId
  }
  if (instrument.cardId) {
    return leg.cardId === instrument.cardId
  }
  return false
}

/** True when the movement moves money into or out of that account or card. */
export function movementTouchesInstrument(
  transaction: FinanceTransaction,
  instrument: FinanceInstrumentRef
): boolean {
  if (
    instrument.accountId &&
    (transaction.accountId === instrument.accountId ||
      transaction.transferToAccountId === instrument.accountId)
  ) {
    return true
  }
  if (
    instrument.cardId &&
    (transaction.cardId === instrument.cardId ||
      transaction.transferToCardId === instrument.cardId)
  ) {
    return true
  }
  return (transaction.legs ?? []).some((leg) =>
    legMatchesInstrument(leg, instrument)
  )
}

/** Sign of a transfer seen from one account or card: money out is negative. */
export function transferSignFromInstrument(
  transaction: FinanceTransaction,
  instrument: FinanceInstrumentRef
): "+" | "−" | null {
  const legs = transaction.legs ?? []
  if (
    legs.some(
      (leg) =>
        leg.legRole === OPERATION_LEG_ROLE.SOURCE &&
        legMatchesInstrument(leg, instrument)
    )
  ) {
    return "−"
  }
  if (
    legs.some(
      (leg) =>
        leg.legRole === OPERATION_LEG_ROLE.DESTINATION &&
        legMatchesInstrument(leg, instrument)
    )
  ) {
    return "+"
  }
  if (instrument.accountId) {
    if (transaction.accountId === instrument.accountId) {
      return "−"
    }
    if (transaction.transferToAccountId === instrument.accountId) {
      return "+"
    }
  }
  if (instrument.cardId) {
    if (transaction.cardId === instrument.cardId) {
      return "−"
    }
    if (transaction.transferToCardId === instrument.cardId) {
      return "+"
    }
  }
  return null
}
