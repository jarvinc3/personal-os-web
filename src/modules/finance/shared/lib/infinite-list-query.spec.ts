import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  buildFinanceListPath,
  financeInfiniteListQuery,
  infiniteListItems,
  type FinanceListPage,
} from "./finance-query-options.ts"

describe("buildFinanceListPath", () => {
  it("returns the bare endpoint without params", () => {
    assert.equal(
      buildFinanceListPath(
        "/finance/loans/loan-1/installments",
        undefined,
        undefined
      ),
      "/finance/loans/loan-1/installments"
    )
  })

  it("serializes params and skips empty values", () => {
    const path = buildFinanceListPath(
      "/finance/receivables/rec-1/payments",
      { limit: 20, cursor: undefined, search: null, empty: "" },
      undefined
    )
    assert.equal(path, "/finance/receivables/rec-1/payments?limit=20")
  })

  it("adds the cursor after the caller params", () => {
    const path = buildFinanceListPath(
      "/finance/budgets",
      { limit: 20 },
      "cursor-1"
    )
    assert.equal(path, "/finance/budgets?limit=20&cursor=cursor-1")
  })
})

describe("financeInfiniteListQuery", () => {
  it("requests the first page without a cursor and reads nextCursor", async () => {
    const paths: string[] = []
    const pages: FinanceListPage[] = [
      { items: [{ id: "a" }], nextCursor: "next-1", hasMore: true },
      { items: [{ id: "b" }], nextCursor: null, hasMore: false },
    ]
    const query = financeInfiniteListQuery<FinanceListPage>({
      queryKey: ["finance", "test"],
      endpoint: "/finance/test",
      params: { limit: 20 },
      get: async <T>(path: string): Promise<T> => {
        paths.push(path)
        return pages[paths.length - 1] as T
      },
    })

    const first = await query.queryFn({ pageParam: undefined })
    assert.deepEqual(paths, ["/finance/test?limit=20"])
    assert.equal(query.getNextPageParam(first), "next-1")

    const second = await query.queryFn({ pageParam: "next-1" })
    assert.deepEqual(paths[1], "/finance/test?limit=20&cursor=next-1")
    assert.equal(query.getNextPageParam(second), undefined)
  })
})

describe("infiniteListItems", () => {
  it("flattens every loaded page in order", () => {
    const items = infiniteListItems<FinanceListPage>({
      pages: [
        { items: [{ id: "a" }], nextCursor: "next-1", hasMore: true },
        { items: [{ id: "b" }, { id: "c" }], nextCursor: null, hasMore: false },
      ],
    })
    assert.deepEqual(items, [{ id: "a" }, { id: "b" }, { id: "c" }])
  })

  it("returns an empty list when there is no data", () => {
    assert.deepEqual(infiniteListItems(undefined), [])
  })
})
