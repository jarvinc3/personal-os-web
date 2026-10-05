import type { QueryClient } from "@tanstack/react-query"

import { FINANCE_BUDGET_PAGE_SIZE } from "./budgets-query.ts"
import {
  accountsQuery,
  budgetsListQuery,
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

type PrefetchClient = Pick<QueryClient, "prefetchQuery">

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
  get?: FinanceQueryGet,
) {
  return Promise.all([queryClient.prefetchQuery(categoriesQuery(get))])
}

export function prefetchFinancePlanning(
  queryClient: PrefetchClient,
  get?: FinanceQueryGet,
) {
  const budgetsQuery = { page: 1, limit: FINANCE_BUDGET_PAGE_SIZE }
  return Promise.all([
    queryClient.prefetchQuery(accountsQuery(get)),
    queryClient.prefetchQuery(institutionsQuery(get)),
    queryClient.prefetchQuery(savingsGoalsQuery(get)),
    queryClient.prefetchQuery(loansQuery(get)),
    queryClient.prefetchQuery(receivablesQuery(get)),
    queryClient.prefetchQuery(categoriesQuery(get)),
    queryClient.prefetchQuery(budgetsListQuery(budgetsQuery, get)),
  ])
}

export function prefetchFinanceSync(
  queryClient: PrefetchClient,
  get?: FinanceQueryGet,
) {
  return Promise.all([
    queryClient.prefetchQuery(institutionsQuery(get)),
    queryClient.prefetchQuery(accountsQuery(get)),
    queryClient.prefetchQuery(cardsQuery(get)),
    queryClient.prefetchQuery(emailMailboxesQuery(get)),
    queryClient.prefetchQuery(emailPendingQuery(get)),
    queryClient.prefetchQuery(emailMessagesQuery(get)),
  ])
}

async function defaultTransactionsGet(path: string) {
  const { apiGet } = await import("@/src/config/api-client")
  return apiGet(path)
}

export function prefetchFinanceCurrentMonth(
  queryClient: PrefetchClient,
  get: FinanceQueryGet = defaultTransactionsGet,
  now: Date = new Date(),
) {
  return queryClient.prefetchQuery(
    timelineMonthQuery(monthKeyFromDate(now), get),
  )
}
