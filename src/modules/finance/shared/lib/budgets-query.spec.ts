import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  buildBudgetsSearchParams,
  budgetsFromPayload,
  FINANCE_BUDGET_PAGE_SIZE,
  formatBudgetPeriodDate,
} from "./budgets-query.ts"

describe("buildBudgetsSearchParams", () => {
  it("sends limit and the cursor when present", () => {
    const first = new URLSearchParams(
      buildBudgetsSearchParams({ limit: FINANCE_BUDGET_PAGE_SIZE })
    )
    assert.equal(first.get("limit"), "20")
    assert.equal(first.has("cursor"), false)

    const next = new URLSearchParams(
      buildBudgetsSearchParams({
        limit: FINANCE_BUDGET_PAGE_SIZE,
        cursor: "cursor-1",
      })
    )
    assert.equal(next.get("cursor"), "cursor-1")
  })
})

describe("formatBudgetPeriodDate", () => {
  it("keeps the calendar day of an UTC midnight ISO string", () => {
    const expected = new Date(2026, 8, 1).toLocaleDateString("es", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    assert.equal(
      formatBudgetPeriodDate("2026-09-01T00:00:00.000Z", "es"),
      expected
    )
    assert.equal(formatBudgetPeriodDate("2026-09-01", "es"), expected)
  })
})

describe("budgetsFromPayload", () => {
  it("reads items and the cursor instead of mapping the list object", () => {
    const listed = budgetsFromPayload({
      items: [{ id: "b1", amountLimit: "100.00" }],
      nextCursor: "cursor-1",
      hasMore: true,
    })
    assert.equal(listed.items.length, 1)
    assert.equal(listed.items[0]?.id, "b1")
    assert.equal(listed.nextCursor, "cursor-1")
    assert.equal(listed.hasMore, true)

    const asArray = budgetsFromPayload([{ id: "nope" }])
    assert.deepEqual(asArray.items, [])

    const nestedData = budgetsFromPayload({
      data: { items: [{ id: "hidden" }], nextCursor: "x" },
    })
    assert.deepEqual(nestedData.items, [])
  })
})
