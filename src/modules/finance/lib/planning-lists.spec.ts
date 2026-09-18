import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { asFinanceArray, visibleReceivables } from "./planning-lists.ts"

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
