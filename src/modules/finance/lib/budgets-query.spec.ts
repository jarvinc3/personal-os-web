import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  buildBudgetsSearchParams,
  budgetsFromPayload,
  FINANCE_BUDGET_PAGE_SIZE,
} from "./budgets-query.ts"

describe("buildBudgetsSearchParams", () => {
  it("sends page=1 and limit=20 on the first load", () => {
    const params = new URLSearchParams(
      buildBudgetsSearchParams({ page: 1, limit: FINANCE_BUDGET_PAGE_SIZE }),
    )
    assert.equal(params.get("page"), "1")
    assert.equal(params.get("limit"), "20")
  })
})

describe("budgetsFromPayload", () => {
  it("reads items and pagination instead of mapping the list object", () => {
    const listed = budgetsFromPayload({
      items: [{ id: "b1", amountLimit: "100.00" }],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    })
    assert.equal(listed.items.length, 1)
    assert.equal(listed.items[0]?.id, "b1")
    assert.equal(listed.pagination.page, 1)

    const asArray = budgetsFromPayload([{ id: "nope" }])
    assert.deepEqual(asArray.items, [])

    const nestedData = budgetsFromPayload({
      data: { items: [{ id: "hidden" }], pagination: { page: 1 } },
    })
    assert.deepEqual(nestedData.items, [])
  })
})
