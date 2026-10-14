import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { FinanceBalanceDrift } from "@/src/modules/finance/shared/types/entities"
import { findProductDrifts, recalculationPayload } from "./integrity.ts"

function drift(overrides: Partial<FinanceBalanceDrift>): FinanceBalanceDrift {
  return {
    id: "drift-1",
    accountId: "acc-1",
    cardId: null,
    currency: "DOP",
    name: "Ahorros",
    storedBalance: "100.00",
    expectedBalance: "0.00",
    difference: "-100.00",
    detectedAt: "2026-10-20T04:00:00.000Z",
    resolvedAt: null,
    ...overrides,
  }
}

describe("findProductDrifts", () => {
  it("keeps only the drifts of the requested account", () => {
    const drifts = [
      drift({ id: "a", accountId: "acc-1" }),
      drift({ id: "b", accountId: "acc-2" }),
    ]
    const matched = findProductDrifts(drifts, { accountId: "acc-1" })
    assert.deepEqual(
      matched.map((item) => item.id),
      ["a"]
    )
  })

  it("matches a card currency exactly", () => {
    const drifts = [
      drift({ id: "dop", accountId: null, cardId: "card-1", currency: "DOP" }),
      drift({ id: "usd", accountId: null, cardId: "card-1", currency: "USD" }),
    ]
    const matched = findProductDrifts(drifts, {
      cardId: "card-1",
      currency: "usd",
    })
    assert.deepEqual(
      matched.map((item) => item.id),
      ["usd"]
    )
  })

  it("returns every currency of a card when none is given", () => {
    const drifts = [
      drift({ id: "dop", accountId: null, cardId: "card-1", currency: "DOP" }),
      drift({ id: "usd", accountId: null, cardId: "card-1", currency: "USD" }),
      drift({
        id: "other",
        accountId: null,
        cardId: "card-2",
        currency: "DOP",
      }),
    ]
    const matched = findProductDrifts(drifts, { cardId: "card-1" })
    assert.deepEqual(
      matched.map((item) => item.id),
      ["dop", "usd"]
    )
  })

  it("returns an empty list when nothing drifted", () => {
    assert.deepEqual(findProductDrifts([], { accountId: "acc-1" }), [])
  })
})

describe("recalculationPayload", () => {
  it("targets the account when the drift belongs to an account", () => {
    assert.deepEqual(recalculationPayload(drift({})), { accountId: "acc-1" })
  })

  it("targets the card and its currency when the drift belongs to a card", () => {
    assert.deepEqual(
      recalculationPayload(
        drift({ accountId: null, cardId: "card-1", currency: "USD" })
      ),
      { cardId: "card-1", currency: "USD" }
    )
  })

  it("throws when the drift references neither product", () => {
    assert.throws(() =>
      recalculationPayload(drift({ accountId: null, cardId: null }))
    )
  })
})
