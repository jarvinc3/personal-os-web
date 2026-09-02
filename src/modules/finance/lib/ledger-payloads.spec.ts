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
    if (!result.ok) return
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
    assert.deepEqual(splitLedgerTarget(encodeLedgerTarget("account", "acc-1")), {
      accountId: "acc-1",
    })
    assert.deepEqual(splitLedgerTarget(encodeLedgerTarget("card", "card-1")), {
      cardId: "card-1",
    })
    assert.deepEqual(splitLedgerTarget("__none__"), {})
  })
})

describe("buildCreateTransferBody", () => {
  it("maps each leg to exactly one of accountId or cardId", () => {
    const result = buildCreateTransferBody({
      fromAccountId: "acc-1",
      toAccountId: "acc-2",
      amount: "20.00",
      transactionDate: "2026-09-02",
    })
    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.equal(result.body.amount, 20)
    assert.equal(typeof result.body.amount, "number")
    assert.equal(result.body.fromAccountId, "acc-1")
    assert.equal(result.body.toAccountId, "acc-2")
    assert.equal("fromCardId" in result.body, false)
  })

  it("sends amount as a number for \"1.50\"", () => {
    const result = buildCreateTransferBody({
      fromAccountId: "acc-1",
      toCardId: "card-1",
      amount: "1.50",
      transactionDate: "2026-09-02",
    })
    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.equal(typeof result.body.amount, "number")
    assert.equal(result.body.amount, 1.5)
    assert.equal(JSON.stringify(result.body).includes('"1.50"'), false)
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
})
