import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  buildTransactionsSearchParams,
  transactionsFromPayload,
} from "./transactions-query.ts"

describe("buildTransactionsSearchParams", () => {
  it("sends page and the DTO filters, omitting empty sentinels", () => {
    const qs = buildTransactionsSearchParams({
      page: 2,
      limit: 20,
      dateFrom: "2026-08-01",
      dateTo: "2026-08-31",
      accountId: "acc-1",
      type: "DEBIT",
      status: "CONFIRMED",
      cardId: "__all__",
      search: "  ",
    })
    const params = new URLSearchParams(qs)
    assert.equal(params.get("page"), "2")
    assert.equal(params.get("limit"), "20")
    assert.equal(params.get("dateFrom"), "2026-08-01")
    assert.equal(params.get("dateTo"), "2026-08-31")
    assert.equal(params.get("accountId"), "acc-1")
    assert.equal(params.get("type"), "DEBIT")
    assert.equal(params.get("status"), "CONFIRMED")
    assert.equal(params.has("cardId"), false)
    assert.equal(params.has("search"), false)
    assert.equal(params.has("categoryId"), false)
  })
})

describe("transactionsFromPayload", () => {
  it("reads items and pagination instead of treating the object as an array", () => {
    const listed = transactionsFromPayload({
      items: [{ id: "t1", amount: "10.00" }],
      pagination: { page: 2, limit: 20, total: 21, totalPages: 2 },
    })
    assert.equal(listed.items.length, 1)
    assert.equal(listed.items[0]?.id, "t1")
    assert.equal(listed.pagination.page, 2)
    assert.equal(listed.pagination.totalPages, 2)

    const asArray = transactionsFromPayload([{ id: "nope" }])
    assert.deepEqual(asArray.items, [])

    const nestedData = transactionsFromPayload({
      data: { items: [{ id: "hidden" }], pagination: { page: 1 } },
    })
    assert.deepEqual(nestedData.items, [])
  })
})
