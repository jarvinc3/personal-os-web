import type {
  FinanceTransaction,
  FinanceTransactionStatus,
  FinanceTransactionType,
} from "@/src/modules/finance/shared/types/entities"
import type { FinancePaginated } from "@/src/modules/finance/shared/types/api"
import { instantToZonedWallTime } from "@/src/shared/lib/zoned-time"

export const FINANCE_TX_FILTER_ALL = "__all__" as const
export const FINANCE_TX_PAGE_SIZE = 20
export const FINANCE_TIMELINE_PAGE_SIZE = 100
export const FINANCE_TIMELINE_STALE_TIME_MS = 5 * 60 * 1000
export const FINANCE_TIMELINE_MAX_PAGES = 50

export type FinanceTransactionsQuery = {
  cursor?: string
  limit: number
  transferGroupId?: string
  accountId?: string
  cardId?: string
  categoryId?: string
  merchantId?: string
  type?: FinanceTransactionType
  status?: FinanceTransactionStatus
  dateFrom?: string
  dateTo?: string
  search?: string
  possibleDuplicates?: boolean
}

const OPTIONAL_KEYS = [
  "transferGroupId",
  "accountId",
  "cardId",
  "categoryId",
  "merchantId",
  "type",
  "status",
  "dateFrom",
  "dateTo",
  "search",
] as const

export function buildTransactionsSearchParams(
  query: FinanceTransactionsQuery
): string {
  const params = new URLSearchParams({
    limit: String(query.limit),
    // The web always reads transfers as one grouped operation with its legs.
    groupOperations: "true",
  })
  if (query.cursor) {
    params.set("cursor", query.cursor)
  }
  if (query.possibleDuplicates) {
    params.set("possibleDuplicates", "true")
  }
  for (const key of OPTIONAL_KEYS) {
    const value = query[key]
    if (
      typeof value === "string" &&
      value.trim() &&
      value !== FINANCE_TX_FILTER_ALL
    ) {
      params.set(key, value.trim())
    }
  }
  return params.toString()
}

/** The instant the API stored becomes the wall clock the user reads. */
export function toUserWallClock(
  transaction: FinanceTransaction,
  timeZone: string
): FinanceTransaction {
  return {
    ...transaction,
    transactionDate: instantToZonedWallTime(
      transaction.transactionDate,
      timeZone
    ),
    legs: transaction.legs?.map((leg) => ({
      ...leg,
      transactionDate: instantToZonedWallTime(leg.transactionDate, timeZone),
    })),
  }
}

export function transactionsFromPayload(
  payload: unknown,
  timeZone: string
): FinancePaginated<FinanceTransaction> {
  const empty: FinancePaginated<FinanceTransaction> = {
    items: [],
    nextCursor: null,
    hasMore: false,
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return empty
  }
  const record = payload as {
    items?: unknown
    nextCursor?: unknown
    hasMore?: unknown
  }
  if (!Array.isArray(record.items)) {
    return empty
  }
  return {
    items: (record.items as FinanceTransaction[]).map((item) =>
      toUserWallClock(item, timeZone)
    ),
    nextCursor:
      typeof record.nextCursor === "string" ? record.nextCursor : null,
    hasMore: record.hasMore === true,
  }
}
