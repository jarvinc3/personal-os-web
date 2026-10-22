import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  buildCreateTransactionBody,
  buildCreateTransferBody,
  encodeLedgerTarget,
  splitLedgerTarget,
} from "./ledger-payloads.ts"

describe("buildCreateTransactionBody", () => {
  it("sends amount as a number, not a money string", () => {
    const result = buildCreateTransactionBody({
      accountId: "acc-1",
      type: "DEBIT",
      amount: "1.50",
      currency: "dop",
      transactionDate: "2026-09-02",
    })
    assert.equal(result.ok, true)
    if (!result.ok) {
      return
    }
    assert.equal(typeof result.body.amount, "number")
    assert.equal(result.body.amount, 1.5)
    assert.equal(result.body.accountId, "acc-1")
    assert.equal("cardId" in result.body, false)
    assert.equal(result.body.currency, "DOP")
    assert.equal(JSON.stringify(result.body).includes('"1.50"'), false)
  })

  it("rejects XOR violations and TRANSFER on POST /transactions", () => {
    const both = buildCreateTransactionBody({
      accountId: "acc-1",
      cardId: "card-1",
      type: "DEBIT",
      amount: "10",
      transactionDate: "2026-09-02",
    })
    assert.equal(both.ok, false)

    const none = buildCreateTransactionBody({
      type: "CREDIT",
      amount: "10",
      transactionDate: "2026-09-02",
    })
    assert.equal(none.ok, false)

    const transfer = buildCreateTransactionBody({
      accountId: "acc-1",
      type: "TRANSFER",
      amount: "10",
      transactionDate: "2026-09-02",
    })
    assert.equal(transfer.ok, false)

    const nan = buildCreateTransactionBody({
      accountId: "acc-1",
      type: "DEBIT",
      amount: "nope",
      transactionDate: "2026-09-02",
    })
    assert.equal(nan.ok, false)
  })

  it("splits encoded account/card destinations", () => {
    assert.deepEqual(
      splitLedgerTarget(encodeLedgerTarget("account", "acc-1")),
      {
        accountId: "acc-1",
      }
    )
    assert.deepEqual(splitLedgerTarget(encodeLedgerTarget("card", "card-1")), {
      cardId: "card-1",
    })
    assert.deepEqual(splitLedgerTarget("__none__"), {})
  })

  it("sends null for empty optionals on update and omits them on create", () => {
    const created = buildCreateTransactionBody({
      accountId: "acc-1",
      type: "DEBIT",
      amount: "10",
      transactionDate: "2026-09-02",
      notes: "",
      merchant: "  ",
      description: "",
      categoryId: "__none__",
    })
    assert.equal(created.ok, true)
    if (!created.ok) {
      return
    }
    assert.equal("notes" in created.body, false)
    assert.equal("merchant" in created.body, false)
    assert.equal("description" in created.body, false)
    assert.equal("categoryId" in created.body, false)

    const updated = buildCreateTransactionBody(
      {
        accountId: "acc-1",
        type: "DEBIT",
        amount: "10",
        transactionDate: "2026-09-02",
        notes: "",
        merchant: "  ",
        description: "",
        categoryId: "__none__",
      },
      { isUpdate: true }
    )
    assert.equal(updated.ok, true)
    if (!updated.ok) {
      return
    }
    assert.equal(updated.body.notes, null)
    assert.equal(updated.body.merchant, null)
    assert.equal(updated.body.description, null)
    assert.equal(updated.body.categoryId, null)
  })
})

describe("buildCreateTransferBody", () => {
  it("maps the origin to an account and the destination to one target", () => {
    const result = buildCreateTransferBody({
      fromAccountId: "acc-1",
      toAccountId: "acc-2",
      amount: "20.00",
      transactionDate: "2026-09-02",
    })
    assert.equal(result.ok, true)
    if (!result.ok) {
      return
    }
    assert.equal(result.body.amount, 20)
    assert.equal(typeof result.body.amount, "number")
    assert.equal(result.body.fromAccountId, "acc-1")
    assert.equal(result.body.toAccountId, "acc-2")
    assert.equal("fromCardId" in result.body, false)
  })

  it('sends amount as a number for "1.50"', () => {
    const result = buildCreateTransferBody({
      fromAccountId: "acc-1",
      toCardId: "card-1",
      amount: "1.50",
      transactionDate: "2026-09-02",
    })
    assert.equal(result.ok, true)
    if (!result.ok) {
      return
    }
    assert.equal(typeof result.body.amount, "number")
    assert.equal(result.body.amount, 1.5)
    assert.equal(JSON.stringify(result.body).includes('"1.50"'), false)
  })

  it("rejects a transfer with no origin account", () => {
    const payload = buildCreateTransferBody({
      toAccountId: "acc-2",
      amount: "20",
      transactionDate: "2026-09-02",
    })
    assert.equal(payload.ok, false)
    if (payload.ok) {
      return
    }
    assert.match(payload.error, /cuenta de origen/)
  })

  it("rejects the same origin and destination", () => {
    const same = buildCreateTransferBody({
      fromAccountId: "acc-1",
      toAccountId: "acc-1",
      amount: "5",
      transactionDate: "2026-09-02",
    })
    assert.equal(same.ok, false)
  })

  it("marks the destination leg as pending when asked", () => {
    const payload = buildCreateTransferBody({
      fromAccountId: "acc-1",
      toAccountId: "acc-2",
      amount: "20",
      transactionDate: "2026-09-02",
      destinationPending: true,
    })
    assert.equal(payload.ok, true)
    if (!payload.ok) {
      return
    }
    assert.equal(payload.body.destinationPending, true)
  })

  it("sends the rate and the received amount as numbers", () => {
    const payload = buildCreateTransferBody({
      fromAccountId: "acc-1",
      toAccountId: "acc-2",
      amount: "100",
      transactionDate: "2026-09-02",
      exchangeRate: "77.6544",
      receivedAmount: "7765.44",
    })
    assert.equal(payload.ok, true)
    if (!payload.ok) {
      return
    }
    assert.equal(payload.body.exchangeRate, 77.6544)
    assert.equal(payload.body.receivedAmount, 7765.44)
  })

  it("rejects a non-positive rate or received amount", () => {
    const rate = buildCreateTransferBody({
      fromAccountId: "acc-1",
      toAccountId: "acc-2",
      amount: "100",
      transactionDate: "2026-09-02",
      exchangeRate: "0",
    })
    assert.equal(rate.ok, false)
    const received = buildCreateTransferBody({
      fromAccountId: "acc-1",
      toAccountId: "acc-2",
      amount: "100",
      transactionDate: "2026-09-02",
      receivedAmount: "0",
    })
    assert.equal(received.ok, false)
  })
})
