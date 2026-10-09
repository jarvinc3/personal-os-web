import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  amountRatioPct,
  asFinanceArray,
  joinPlanningCaption,
  loanProgressSummary,
  visibleReceivables,
} from "./planning-lists.ts"

describe("asFinanceArray", () => {
  it("returns the array payload as-is", () => {
    const rows = [{ id: "1" }, { id: "2" }]
    assert.deepEqual(asFinanceArray(rows), rows)
  })

  it("does not treat a paginated { items } object as the list", () => {
    const payload = { items: [{ id: "1" }], pagination: { page: 1 } }
    assert.deepEqual(asFinanceArray(payload), [])
  })

  it("returns empty for null or a plain object", () => {
    assert.deepEqual(asFinanceArray(null), [])
    assert.deepEqual(asFinanceArray({ id: "1" }), [])
  })
})

describe("amountRatioPct", () => {
  it("returns percent of numerator over denominator", () => {
    assert.equal(amountRatioPct("85", "100"), 85)
    assert.equal(amountRatioPct(0, 50), 0)
  })

  it("allows values over 100", () => {
    assert.equal(amountRatioPct("120", "100"), 120)
  })

  it("returns null when the total is missing or zero", () => {
    assert.equal(amountRatioPct("10", "0"), null)
    assert.equal(amountRatioPct("10", null), null)
    assert.equal(amountRatioPct("abc", "100"), null)
  })
})

describe("joinPlanningCaption", () => {
  it("joins non-empty parts", () => {
    assert.equal(joinPlanningCaption("Faltan $10", "", "15 oct"), "Faltan $10 · 15 oct")
  })

  it("returns undefined when nothing is left", () => {
    assert.equal(joinPlanningCaption("  ", null), undefined)
  })
})

describe("loanProgressSummary", () => {
  it("uses the paid amount to calculate an active loan progress", () => {
    assert.deepEqual(
      loanProgressSummary({
        originalAmount: "100000",
        currentBalance: "90000",
        paidInstallments: 1,
        totalInstallments: 10,
      }),
      { paidOff: false, progress: 10 },
    )
  })

  it("falls back to installment progress when amounts cannot be parsed", () => {
    assert.deepEqual(
      loanProgressSummary({
        originalAmount: "invalid",
        currentBalance: "invalid",
        paidInstallments: 3,
        totalInstallments: 12,
      }),
      { paidOff: false, progress: 25 },
    )
  })

  it("marks a zero-balance loan as paid off", () => {
    assert.deepEqual(
      loanProgressSummary({
        originalAmount: "100",
        currentBalance: "0",
        paidInstallments: 10,
        totalInstallments: 10,
      }),
      { paidOff: true, progress: 100 },
    )
  })
})

describe("visibleReceivables", () => {
  it("hides CANCELLED and keeps PENDING and PAID", () => {
    const listed = visibleReceivables([
      { id: "1", status: "PENDING" },
      { id: "2", status: "CANCELLED" },
      { id: "3", status: "PAID" },
    ])
    assert.deepEqual(listed, [
      { id: "1", status: "PENDING" },
      { id: "3", status: "PAID" },
    ])
  })
})
