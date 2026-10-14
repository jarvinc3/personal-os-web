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
      buildFinanceListPath({
        endpoint: "/finance/loans/loan-1/installments",
        cursor: undefined,
      }),
      "/finance/loans/loan-1/installments"
    )
  })

  it("serializes params and skips empty values", () => {
    const path = buildFinanceListPath({
      endpoint: "/finance/receivables/rec-1/payments",
      params: { limit: 20, cursor: undefined, search: null, empty: "" },
      cursor: undefined,
    })
    assert.equal(path, "/finance/receivables/rec-1/payments?limit=20")
  })

  it("adds the cursor after the caller params", () => {
    const path = buildFinanceListPath({
      endpoint: "/finance/budgets",
      params: { limit: 20 },
      cursor: "cursor-1",
    })
    assert.equal(path, "/finance/budgets?limit=20&cursor=cursor-1")
  })

  it("lets the page cursor win over a cursor in the caller params", () => {
    const path = buildFinanceListPath({
      endpoint: "/finance/budgets",
      params: { limit: 20, cursor: "stale" },
      cursor: "fresh",
    })
    assert.equal(path, "/finance/budgets?limit=20&cursor=fresh")
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

  it("keeps following nextCursor across several pages", () => {
    const pages: Record<string, FinanceListPage> = {
      "": { items: [{ id: "a" }], nextCursor: "c1", hasMore: true },
      c1: { items: [{ id: "b" }], nextCursor: "c2", hasMore: true },
      c2: { items: [{ id: "c" }], nextCursor: null, hasMore: false },
    }
    const query = financeInfiniteListQuery<FinanceListPage>({
      queryKey: ["finance", "test"],
      endpoint: "/finance/test",
    })

    const visited: string[] = []
    let page: FinanceListPage | undefined = pages[""]
    while (page) {
      visited.push(...page.items.map((item) => String(item.id)))
      const next = query.getNextPageParam(page)
      page = next ? pages[next] : undefined
    }

    assert.deepEqual(visited, ["a", "b", "c"])
  })

  it("stops when the first page is empty", () => {
    const query = financeInfiniteListQuery<FinanceListPage>({
      queryKey: ["finance", "test"],
      endpoint: "/finance/test",
    })
    const emptyPage: FinanceListPage = {
      items: [],
      nextCursor: null,
      hasMore: false,
    }

    assert.equal(query.getNextPageParam(emptyPage), undefined)
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
