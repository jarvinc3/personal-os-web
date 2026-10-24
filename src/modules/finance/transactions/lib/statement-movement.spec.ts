import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type {
  FinanceCardStatementMovement,
  FinanceStatementImportExtra,
} from "@/src/modules/finance/shared/types/entities"
import {
  fromStatementImportExtra,
  fromStatementLine,
} from "./statement-movement.ts"

const line: FinanceCardStatementMovement = {
  id: "stmt-1",
  type: "DEBIT",
  status: "CONFIRMED",
  amount: "1200.00",
  currency: "USD",
  ledgerAmount: "72000.00",
  ledgerCurrency: "DOP",
  transactionDate: "2026-10-20T15:30:00.000Z",
  merchant: "Comercio Ejemplo",
  description: "Compra con tarjeta",
  transferGroupId: null,
}

const extra: FinanceStatementImportExtra = {
  id: "extra-1",
  date: "2026-10-21T09:00:00.000Z",
  description: "Cargo de la app",
  merchant: "Comercio Extra",
  amount: "450.00",
  currency: "DOP",
  type: "CREDIT",
}

describe("fromStatementLine", () => {
  it("shows the ledger amount and the type of the line", () => {
    const row = fromStatementLine(line)

    assert.equal(row.title, "Comercio Ejemplo")
    assert.equal(row.date, "2026-10-20T15:30:00.000Z")
    assert.equal(row.amount, "72000.00")
    assert.equal(row.currency, "DOP")
    assert.equal(row.type, "DEBIT")
  })

  it("uses the description when the line has no merchant", () => {
    const row = fromStatementLine({ ...line, merchant: null })

    assert.equal(row.title, "Compra con tarjeta")
  })

  it("falls back to Movimiento without merchant or description", () => {
    const row = fromStatementLine({
      ...line,
      merchant: null,
      description: null,
    })

    assert.equal(row.title, "Movimiento")
  })

  it("fails on a type the movement row does not know", () => {
    assert.throws(() => fromStatementLine({ ...line, type: "FEE" }))
  })
})

describe("fromStatementImportExtra", () => {
  it("shows the amount and the type of the extra", () => {
    const row = fromStatementImportExtra(extra)

    assert.equal(row.title, "Comercio Extra")
    assert.equal(row.date, "2026-10-21T09:00:00.000Z")
    assert.equal(row.amount, "450.00")
    assert.equal(row.currency, "DOP")
    assert.equal(row.type, "CREDIT")
  })

  it("uses the description when the extra has no merchant", () => {
    const row = fromStatementImportExtra({ ...extra, merchant: null })

    assert.equal(row.title, "Cargo de la app")
  })

  it("reads a card payment as a transfer", () => {
    const row = fromStatementImportExtra({ ...extra, type: "CARD_PAYMENT" })

    assert.equal(row.type, "TRANSFER")
  })

  it("fails on a type the movement row does not know", () => {
    assert.throws(() => fromStatementImportExtra({ ...extra, type: "FEE" }))
  })
})
