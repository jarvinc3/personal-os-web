import { test } from "node:test"
import assert from "node:assert/strict"
import {
  accountsQuery,
  FINANCE_LOOKUP_PAGE_LIMIT,
} from "./finance-query-options.ts"

test("lookup query requests one page capped at the lookup limit", async () => {
  const calls: string[] = []
  const get = async <T>(path: string): Promise<T> => {
    calls.push(path)
    return { items: [], nextCursor: null, hasMore: false } as T
  }

  await accountsQuery(get).queryFn()

  assert.deepEqual(calls, [
    `/finance/accounts?limit=${FINANCE_LOOKUP_PAGE_LIMIT}`,
  ])
})

test("lookup query unwraps items from the cursor page", async () => {
  const get = async <T>(): Promise<T> =>
    ({
      items: [{ id: "acc-1" }],
      nextCursor: "next",
      hasMore: true,
    }) as T

  const rows = await accountsQuery(get).queryFn()

  assert.deepEqual(rows, [{ id: "acc-1" }])
})

test("lookup query returns an empty list on a malformed payload", async () => {
  const get = async <T>(): Promise<T> => ({ items: null }) as T

  const rows = await accountsQuery(get).queryFn()

  assert.deepEqual(rows, [])
})
