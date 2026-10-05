import assert from "node:assert/strict"
import { afterEach, describe, it } from "node:test"

import { QueryClient } from "@tanstack/react-query"

import { FINANCE_BUDGET_PAGE_SIZE } from "./budgets-query.ts"
import {
  prefetchFinanceCategories,
  prefetchFinanceCurrentMonth,
  prefetchFinancePlanning,
  prefetchFinanceSync,
  scheduleIdle,
} from "./finance-prefetch.ts"
import { budgetsListQuery } from "./finance-query-options.ts"
import {
  FINANCE_ACCOUNTS_QUERY_KEY,
  FINANCE_BUDGETS_QUERY_KEY,
  FINANCE_CARDS_QUERY_KEY,
  FINANCE_CATEGORIES_QUERY_KEY,
  FINANCE_EMAIL_MAILBOXES_QUERY_KEY,
  FINANCE_EMAIL_MESSAGES_QUERY_KEY,
  FINANCE_EMAIL_PENDING_QUERY_KEY,
  FINANCE_INSTITUTIONS_QUERY_KEY,
  FINANCE_LOANS_QUERY_KEY,
  FINANCE_RECEIVABLES_QUERY_KEY,
  FINANCE_SAVINGS_GOALS_QUERY_KEY,
  FINANCE_TRANSACTIONS_QUERY_KEY,
} from "../types/api.ts"

const PLANNING_KEYS = [
  FINANCE_ACCOUNTS_QUERY_KEY,
  FINANCE_INSTITUTIONS_QUERY_KEY,
  FINANCE_SAVINGS_GOALS_QUERY_KEY,
  FINANCE_LOANS_QUERY_KEY,
  FINANCE_RECEIVABLES_QUERY_KEY,
  FINANCE_CATEGORIES_QUERY_KEY,
  [...FINANCE_BUDGETS_QUERY_KEY, "list", { page: 1, limit: FINANCE_BUDGET_PAGE_SIZE }],
] as const

const SYNC_KEYS = [
  FINANCE_INSTITUTIONS_QUERY_KEY,
  FINANCE_ACCOUNTS_QUERY_KEY,
  FINANCE_CARDS_QUERY_KEY,
  FINANCE_EMAIL_MAILBOXES_QUERY_KEY,
  FINANCE_EMAIL_PENDING_QUERY_KEY,
  FINANCE_EMAIL_MESSAGES_QUERY_KEY,
] as const

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 30_000,
      },
    },
  })
}

function createMockGet() {
  const paths: string[] = []
  const get = async <T = unknown>(path: string): Promise<T> => {
    paths.push(path)
    if (path.startsWith("/finance/budgets")) {
      return {
        items: [],
        pagination: {
          page: 1,
          limit: FINANCE_BUDGET_PAGE_SIZE,
          total: 0,
          totalPages: 1,
        },
      } as T
    }
    return [] as T
  }
  return { get, paths }
}

describe("prefetchFinancePlanning", () => {
  it("writes the 7 planning keys into cache", async () => {
    const queryClient = createQueryClient()
    const { get, paths } = createMockGet()
    await prefetchFinancePlanning(queryClient, get)
    assert.deepEqual(
      [...new Set(paths)].sort(),
      [
        "/finance/accounts",
        "/finance/budgets?page=1&limit=20",
        "/finance/categories",
        "/finance/institutions",
        "/finance/loans",
        "/finance/receivables",
        "/finance/savings-goals",
      ],
    )

    for (const key of PLANNING_KEYS) {
      assert.ok(
        queryClient.getQueryState(key),
        `missing cache entry for ${JSON.stringify(key)}`,
      )
    }
  })

  it("does not refetch budgets page 1 after prefetch", async () => {
    const queryClient = createQueryClient()
    const { get, paths } = createMockGet()
    await prefetchFinancePlanning(queryClient, get)
    const budgetGets = paths.filter((path) => path.startsWith("/finance/budgets"))
    assert.equal(budgetGets.length, 1)

    await queryClient.prefetchQuery(
      budgetsListQuery({ page: 1, limit: FINANCE_BUDGET_PAGE_SIZE }, get),
    )
    const budgetGetsAfter = paths.filter((path) =>
      path.startsWith("/finance/budgets"),
    )
    assert.equal(budgetGetsAfter.length, 1)
    assert.equal(
      queryClient.getQueryState([
        ...FINANCE_BUDGETS_QUERY_KEY,
        "list",
        { page: 1, limit: FINANCE_BUDGET_PAGE_SIZE },
      ])?.fetchStatus,
      "idle",
    )
  })
})

describe("prefetchFinanceSync", () => {
  it("writes the 6 sync keys into cache", async () => {
    const queryClient = createQueryClient()
    const { get } = createMockGet()
    await prefetchFinanceSync(queryClient, get)

    for (const key of SYNC_KEYS) {
      assert.ok(
        queryClient.getQueryState(key),
        `missing cache entry for ${JSON.stringify(key)}`,
      )
    }
  })
})

describe("prefetchFinanceCategories", () => {
  it("writes the categories key into cache", async () => {
    const queryClient = createQueryClient()
    const { get } = createMockGet()
    await prefetchFinanceCategories(queryClient, get)
    assert.ok(queryClient.getQueryState(FINANCE_CATEGORIES_QUERY_KEY))
  })
})

describe("prefetchFinanceCurrentMonth", () => {
  it("writes the current month timeline key into cache", async () => {
    const queryClient = createQueryClient()
    const { get, paths } = createMockGet()
    await prefetchFinanceCurrentMonth(
      queryClient,
      get,
      new Date(2026, 9, 5),
    )
    assert.match(paths[0] ?? "", /\/finance\/transactions\?/)
    assert.match(paths[0] ?? "", /dateFrom=2026-10-01/)
    assert.match(paths[0] ?? "", /dateTo=2026-10-31/)
    assert.ok(
      queryClient.getQueryState([
        ...FINANCE_TRANSACTIONS_QUERY_KEY,
        "timeline",
        "month",
        "2026-10",
      ]),
    )
  })
})

describe("scheduleIdle", () => {
  const originalRequestIdle = globalThis.requestIdleCallback
  const originalCancelIdle = globalThis.cancelIdleCallback

  afterEach(() => {
    if (originalRequestIdle) {
      globalThis.requestIdleCallback = originalRequestIdle
    } else {
      Reflect.deleteProperty(globalThis, "requestIdleCallback")
    }
    if (originalCancelIdle) {
      globalThis.cancelIdleCallback = originalCancelIdle
    } else {
      Reflect.deleteProperty(globalThis, "cancelIdleCallback")
    }
  })

  it("falls back to timeout and can cancel before running", async () => {
    Reflect.deleteProperty(globalThis, "requestIdleCallback")
    let ran = false
    const cancel = scheduleIdle(() => {
      ran = true
    })
    cancel()
    await new Promise((resolve) => setTimeout(resolve, 20))
    assert.equal(ran, false)
  })

  it("runs the callback after idle timeout", async () => {
    Reflect.deleteProperty(globalThis, "requestIdleCallback")
    let ran = false
    scheduleIdle(() => {
      ran = true
    })
    await new Promise((resolve) => setTimeout(resolve, 20))
    assert.equal(ran, true)
  })
})
