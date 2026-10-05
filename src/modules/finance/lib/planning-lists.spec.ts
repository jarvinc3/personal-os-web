import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  amountRatioPct,
  asFinanceArray,
  joinPlanningCaption,
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
