import { FINANCE_TRANSACTIONS_QUERY_KEY } from "@/src/modules/finance/shared/types/api"
import type { FinanceTransaction } from "@/src/modules/finance/shared/types/entities"
import { parseMonthKey, type MonthKey } from "./month-window.ts"
import {
  FINANCE_TIMELINE_MAX_PAGES,
  FINANCE_TIMELINE_PAGE_SIZE,
  FINANCE_TIMELINE_STALE_TIME_MS,
  buildTransactionsSearchParams,
  transactionsFromPayload,
  type FinanceTransactionsQuery,
} from "./transactions-query-params.ts"
import { zonedMonthEnd, zonedMonthStart } from "@/src/shared/lib/zoned-time"

export function timelineMonthQueryKey(month: MonthKey, timeZone: string) {
  return [
    ...FINANCE_TRANSACTIONS_QUERY_KEY,
    "timeline",
    "month",
    month,
    timeZone,
  ] as const
}

export function timelineMonthQuery({
  month,
  get,
  timeZone,
}: {
  month: MonthKey
  get: (path: string) => Promise<unknown>
  timeZone: string
}) {
  const parsed = parseMonthKey(month)
  return {
    queryKey: timelineMonthQueryKey(month, timeZone),
    staleTime: FINANCE_TIMELINE_STALE_TIME_MS,
    queryFn: () =>
      fetchAllTransactionPages({
        query: {
          dateFrom: zonedMonthStart(parsed.year, parsed.month, timeZone),
          dateTo: zonedMonthEnd(parsed.year, parsed.month, timeZone),
          limit: FINANCE_TIMELINE_PAGE_SIZE,
        },
        get,
        timeZone,
      }),
  }
}

export function mergeTransactionsById<T extends { id: string }>(
  groups: ReadonlyArray<readonly T[]>
): T[] {
  const byId = new Map<string, T>()
  for (const group of groups) {
    for (const item of group) {
      byId.set(item.id, item)
    }
  }
  return [...byId.values()]
}

export async function fetchAllTransactionPages({
  query,
  get,
  timeZone,
}: {
  query: Omit<FinanceTransactionsQuery, "cursor">
  get: (path: string) => Promise<unknown>
  timeZone: string
}): Promise<FinanceTransaction[]> {
  const items: FinanceTransaction[] = []
  let cursor: string | undefined
  let pages = 0
  for (;;) {
    const search = buildTransactionsSearchParams({ ...query, cursor })
    const payload = await get(`/finance/transactions?${search}`)
    const listed = transactionsFromPayload(payload, timeZone)
    items.push(...listed.items)
    cursor = listed.nextCursor ?? undefined
    pages += 1
    if (!cursor || pages >= FINANCE_TIMELINE_MAX_PAGES) {
      break
    }
  }
  return items
}
