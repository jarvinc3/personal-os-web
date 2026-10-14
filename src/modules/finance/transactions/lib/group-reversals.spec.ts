import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { FinanceTransaction } from "../../shared/types/entities.ts"
import { groupReversals } from "./group-reversals.ts"

type TransactionOverrides = Pick<FinanceTransaction, "id"> &
  Partial<
    Pick<
      FinanceTransaction,
      "type" | "status" | "amount" | "transactionDate" | "linkedTransactionId"
    >
  >

function tx(overrides: TransactionOverrides): FinanceTransaction {
  return {
    type: "DEBIT",
    status: "CONFIRMED",
    amount: "100.00",
    transactionDate: "2026-04-02T10:00:00.000Z",
    linkedTransactionId: null,
    currency: "DOP",
    editable: "FULL",
    ledgerAmount: "100.00",
    ledgerCurrency: "DOP",
    amountBaseCurrency: "100.00",
    exchangeRate: null,
    accountId: "acc-1",
    accountName: "Cuenta",
    cardId: null,
    cardName: null,
    categoryId: null,
    merchant: overrides.id,
    notes: null,
    source: "EMAIL",
    description: null,
    transferGroupId: null,
    transferToAccountId: null,
    transferToAccountName: null,
    transferToCardId: null,
    transferToCardName: null,
    ...overrides,
  }
}

describe("groupReversals", () => {
  it("pairs a reversal with its original in one group", () => {
    const original = tx({ id: "original" })
    const reversal = tx({
      id: "reversal",
      status: "REVERSED",
      linkedTransactionId: "original",
    })

    const groups = groupReversals([original, reversal])

    assert.equal(groups.length, 1)
    assert.equal(groups[0]?.original.id, "original")
    assert.equal(groups[0]?.reversal?.id, "reversal")
    assert.equal(groups[0]?.isPartial, false)
    assert.equal(groups[0]?.isOrphan, false)
  })

  it("keeps the group at the original's position in the list", () => {
    const reversal = tx({
      id: "reversal",
      status: "REVERSED",
      linkedTransactionId: "original",
      transactionDate: "2026-03-01T10:00:00.000Z",
    })
    const other = tx({ id: "other" })
    const original = tx({ id: "original" })

    const groups = groupReversals([reversal, other, original])

    assert.deepEqual(
      groups.map((group) => group.original.id),
      ["other", "original"]
    )
    assert.equal(groups[1]?.reversal?.id, "reversal")
  })

  it("detects a link that points from the original to the reversal", () => {
    const original = tx({ id: "original", linkedTransactionId: "reversal" })
    const reversal = tx({ id: "reversal", status: "REVERSED" })

    const groups = groupReversals([original, reversal])

    assert.equal(groups.length, 1)
    assert.equal(groups[0]?.original.id, "original")
    assert.equal(groups[0]?.reversal?.id, "reversal")
  })

  it("shows a reversal alone when its original is not loaded", () => {
    const reversal = tx({
      id: "reversal",
      status: "REVERSED",
      linkedTransactionId: "missing-original",
    })

    const groups = groupReversals([reversal])

    assert.equal(groups.length, 1)
    assert.equal(groups[0]?.original.id, "reversal")
    assert.equal(groups[0]?.reversal, undefined)
    assert.equal(groups[0]?.isOrphan, true)
  })

  it("leaves a partial reversal as two rows with the partial flag", () => {
    const original = tx({ id: "original", amount: "100.00" })
    const reversal = tx({
      id: "reversal",
      status: "REVERSED",
      amount: "40.00",
      linkedTransactionId: "original",
    })

    const groups = groupReversals([original, reversal])

    assert.equal(groups.length, 2)
    assert.deepEqual(
      groups.map((group) => group.original.id),
      ["original", "reversal"]
    )
    assert.equal(
      groups.every((group) => group.reversal === undefined),
      true
    )
    assert.equal(
      groups.every((group) => group.isPartial),
      true
    )
  })

  it("keeps unrelated movements as single groups", () => {
    const groups = groupReversals([tx({ id: "a" }), tx({ id: "b" })])

    assert.deepEqual(
      groups.map((group) => group.original.id),
      ["a", "b"]
    )
    assert.equal(
      groups.every((group) => group.reversal === undefined),
      true
    )
    assert.equal(
      groups.every((group) => !group.isPartial && !group.isOrphan),
      true
    )
  })
})
