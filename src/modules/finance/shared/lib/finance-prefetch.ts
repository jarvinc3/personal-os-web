import type { QueryClient } from "@tanstack/react-query"

import { FINANCE_BUDGET_PAGE_SIZE } from "./budgets-query.ts"
import {
  accountsQuery,
  budgetsInfiniteQuery,
  cardsQuery,
  categoriesQuery,
  emailMailboxesQuery,
  emailMessagesQuery,
  emailPendingQuery,
  institutionsQuery,
  loansQuery,
  receivablesQuery,
  savingsGoalsQuery,
  type FinanceQueryGet,
} from "./finance-query-options.ts"
import { monthKeyFromDate } from "./month-window.ts"
import { timelineMonthQuery } from "./transactions-query.ts"

type PrefetchClient = Pick<
  QueryClient,
  "prefetchQuery" | "prefetchInfiniteQuery"
>

export function scheduleIdle(callback: () => void): () => void {
  const requestIdle = globalThis.requestIdleCallback
  if (typeof requestIdle === "function") {
    const id = requestIdle(() => {
      callback()
    })
    return () => globalThis.cancelIdleCallback(id)
  }
  const id = setTimeout(callback, 1)
  return () => clearTimeout(id)
}

export function prefetchFinanceCategories(
  queryClient: PrefetchClient,
  get?: FinanceQueryGet
) {
  return Promise.all([queryClient.prefetchQuery(categoriesQuery(get))])
}

export function prefetchFinancePlanning(
  queryClient: PrefetchClient,
  get?: FinanceQueryGet
) {
  const budgetsQuery = { limit: FINANCE_BUDGET_PAGE_SIZE }
  return Promise.all([
    queryClient.prefetchQuery(accountsQuery(get)),
    queryClient.prefetchQuery(institutionsQuery(get)),
    queryClient.prefetchQuery(savingsGoalsQuery(get)),
    queryClient.prefetchQuery(loansQuery(get)),
    queryClient.prefetchQuery(receivablesQuery(get)),
    queryClient.prefetchQuery(categoriesQuery(get)),
    queryClient.prefetchInfiniteQuery(budgetsInfiniteQuery(budgetsQuery, get)),
  ])
}

export function prefetchFinanceSync(
  queryClient: PrefetchClient,
  get?: FinanceQueryGet
) {
  return Promise.all([
    queryClient.prefetchQuery(institutionsQuery(get)),
    queryClient.prefetchQuery(accountsQuery(get)),
    queryClient.prefetchQuery(cardsQuery(get)),
    queryClient.prefetchQuery(emailMailboxesQuery(get)),
    queryClient.prefetchInfiniteQuery(emailPendingQuery(get)),
    queryClient.prefetchInfiniteQuery(emailMessagesQuery(get)),
  ])
}

async function defaultTransactionsGet<T = unknown>(path: string): Promise<T> {
  const { apiGet } = await import("@/src/config/api-client")
  return apiGet<T>(path)
}

export function prefetchFinanceCurrentMonth(
  queryClient: PrefetchClient,
  timeZone: string,
  get: FinanceQueryGet = defaultTransactionsGet,
  now: Date = new Date()
) {
  return queryClient.prefetchQuery(
    timelineMonthQuery(monthKeyFromDate(now), get, timeZone)
  )
}
