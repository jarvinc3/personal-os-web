import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type {
  FinanceCard,
  FinanceCardStatementMovement,
} from "@/src/modules/finance/shared/types/entities"
import { statementMovementToTransaction } from "./statement-movement.ts"

const card: FinanceCard = {
  id: "card-1",
  institutionId: "inst-1",
  institutionName: "Banco Ejemplo",
  institutionLogoUrl: null,
  networkLogoUrl: null,
  accountId: "acc-1",
  accountName: "Cuenta principal",
  name: "Tarjeta Ejemplo",
  type: "CREDIT",
  network: "VISA",
  lastFour: "4242",
  statementClosingDay: 28,
  paymentDueDay: 5,
  nextStatementDate: null,
  nextPaymentDueDate: null,
  color: null,
  isActive: true,
  balances: [],
}

const movement: FinanceCardStatementMovement = {
  id: "stmt-1",
  type: "DEBIT",
  status: "CONFIRMED",
  amount: "1250.00",
  currency: "DOP",
  ledgerAmount: "1250.00",
  ledgerCurrency: "DOP",
  transactionDate: "2026-10-20T15:30:00.000Z",
  merchant: "Comercio Ejemplo",
  description: "Compra con tarjeta",
  transferGroupId: null,
}

describe("statementMovementToTransaction", () => {
  it("maps the card, the merchant and the money of the statement row", () => {
    const transaction = statementMovementToTransaction({ movement, card })

    assert.equal(transaction.type, "DEBIT")
    assert.equal(transaction.status, "CONFIRMED")
    assert.equal(transaction.amount, "1250.00")
    assert.equal(transaction.currency, "DOP")
    assert.equal(transaction.cardId, "card-1")
    assert.equal(transaction.accountName, "Cuenta principal")
    assert.equal(transaction.merchant, "Comercio Ejemplo")
    assert.equal(transaction.source, "STATEMENT")
  })

  it("keeps a pending statement row pending", () => {
    const transaction = statementMovementToTransaction({
      movement: { ...movement, status: "PENDING" },
      card,
    })

    assert.equal(transaction.status, "PENDING")
  })

  it("fails on a status the movement row does not know", () => {
    assert.throws(() =>
      statementMovementToTransaction({
        movement: { ...movement, status: "UNKNOWN" },
        card,
      })
    )
  })

  it("fails on a type the movement row does not know", () => {
    assert.throws(() =>
      statementMovementToTransaction({
        movement: { ...movement, type: "FEE" },
        card,
      })
    )
  })
})
