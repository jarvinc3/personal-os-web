import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  bankChargesRange,
  moneyMagnitude,
  reconciliationDifference,
  reconciliationLinePayloads,
  reconciliationLinesFromSuggestion,
  reconciliationLinesMatchDifference,
  reconciliationLinesTotal,
  reconciliationMonth,
} from "./reconciliation.ts"

describe("reconciliationDifference", () => {
  it("is negative when the bank shows less than the app", () => {
    assert.equal(reconciliationDifference("10000.00", "9950.00"), -50)
  })

  it("returns null when an amount cannot be read", () => {
    assert.equal(reconciliationDifference("10000.00", ""), null)
  })
})

describe("reconciliationLinesTotal", () => {
  it("adds signed lines and ignores empty ones", () => {
    const total = reconciliationLinesTotal([
      { kind: "IMPUESTO_DGII", amount: "-15" },
      { kind: "OTRO", amount: "-35" },
      { kind: "COMISION", amount: "" },
    ])
    assert.equal(total, -50)
  })
})

describe("reconciliationLinesMatchDifference", () => {
  it("is true only when the lines add up to the difference", () => {
    const lines = [
      { kind: "IMPUESTO_DGII" as const, amount: "-15" },
      { kind: "OTRO" as const, amount: "-35" },
    ]
    assert.equal(reconciliationLinesMatchDifference(lines, -50), true)
    assert.equal(reconciliationLinesMatchDifference(lines, -40), false)
  })
})

describe("reconciliationLinePayloads", () => {
  it("drops zero and empty lines and returns numbers", () => {
    assert.deepEqual(
      reconciliationLinePayloads([
        { kind: "IMPUESTO_DGII", amount: "-15" },
        { kind: "OTRO", amount: "0" },
        { kind: "COMISION", amount: "" },
      ]),
      [{ kind: "IMPUESTO_DGII", amount: -15 }]
    )
  })
})

describe("reconciliationLinesFromSuggestion", () => {
  it("prefills the suggested lines", () => {
    assert.deepEqual(
      reconciliationLinesFromSuggestion([
        { kind: "IMPUESTO_DGII", amount: "-15.00" },
        { kind: "OTRO", amount: "-35.00" },
      ]),
      [
        { kind: "IMPUESTO_DGII", amount: "-15.00" },
        { kind: "OTRO", amount: "-35.00" },
      ]
    )
  })

  it("falls back to one empty line without suggestion", () => {
    assert.deepEqual(reconciliationLinesFromSuggestion([]), [
      { kind: "OTRO", amount: "" },
    ])
  })
})

describe("reconciliationMonth", () => {
  it("returns YYYY-MM", () => {
    assert.equal(reconciliationMonth("2026-10-15"), "2026-10")
  })
})

describe("bankChargesRange", () => {
  it("covers the calendar year up to today", () => {
    assert.deepEqual(bankChargesRange("2026-10-15"), {
      from: "2026-01-01",
      to: "2026-10-15",
    })
  })
})

describe("moneyMagnitude", () => {
  it("returns the absolute amount and 0 for unreadable values", () => {
    assert.equal(moneyMagnitude("-35.00"), 35)
    assert.equal(moneyMagnitude("nope"), 0)
  })
})
