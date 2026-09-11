import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { encodeLedgerTarget } from "./ledger-payloads.ts"
import {
  currencyForTarget,
  sliceDateInput,
  todayDateInput,
} from "./ledger-form.ts"

describe("todayDateInput", () => {
  it("formats local YYYY-MM-DD", () => {
    assert.equal(todayDateInput(new Date(2026, 8, 11)), "2026-09-11")
  })
})

describe("sliceDateInput", () => {
  it("keeps the date part of an ISO timestamp", () => {
    assert.equal(sliceDateInput("2026-09-11T12:00:00.000Z"), "2026-09-11")
  })
})

describe("currencyForTarget", () => {
  it("prefers the account or first card balance currency", () => {
    assert.equal(
      currencyForTarget(
        encodeLedgerTarget("account", "acc-1"),
        [{ id: "acc-1", currency: "USD" } as never],
        [],
        "DOP",
      ),
      "USD",
    )
    assert.equal(
      currencyForTarget(
        encodeLedgerTarget("card", "card-1"),
        [],
        [{ id: "card-1", balances: [{ currency: "EUR" }] } as never],
        "DOP",
      ),
      "EUR",
    )
  })
})
