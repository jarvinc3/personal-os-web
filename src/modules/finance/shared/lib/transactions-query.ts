import {
  FINANCE_TRANSACTIONS_QUERY_KEY,
  type FinancePaginated,
} from "@/src/modules/finance/shared/types/api"
import { isoMonthBounds, parseMonthKey, type MonthKey } from "./month-window.ts"
import type {
  FinanceTransaction,
  FinanceTransactionStatus,
  FinanceTransactionType,
} from "@/src/modules/finance/shared/types/entities"
import { formatFinanceDateTimeLabel } from "./ledger-form.ts"
import {
  formatFinanceMoney,
  parseFinanceMoney,
  type FinanceMoneyDisplay,
} from "./money.ts"

export const FINANCE_TX_FILTER_ALL = "__all__" as const
export const FINANCE_TX_PAGE_SIZE = 20
export const FINANCE_TIMELINE_PAGE_SIZE = 100
export const FINANCE_TIMELINE_STALE_TIME_MS = 5 * 60 * 1000
const FINANCE_TIMELINE_MAX_PAGES = 50

export type FinanceTransactionsQuery = {
  cursor?: string
  limit: number
  transferGroupId?: string
  accountId?: string
  cardId?: string
  categoryId?: string
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

export function transactionsFromPayload(
  payload: unknown
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
    items: record.items as FinanceTransaction[],
    nextCursor:
      typeof record.nextCursor === "string" ? record.nextCursor : null,
    hasMore: record.hasMore === true,
  }
}

export function formatTransactionDate(value: string): string {
  return formatFinanceDateTimeLabel(value)
}

export function canReverseTransaction(
  tx: Pick<FinanceTransaction, "status" | "transferGroupId" | "type">
): boolean {
  if (tx.transferGroupId || tx.type === "TRANSFER") {
    return false
  }
  return tx.status === "CONFIRMED"
}

export function isTransferTransaction(
  item: Pick<FinanceTransaction, "type" | "transferGroupId">
): boolean {
  return item.type === "TRANSFER" || Boolean(item.transferGroupId)
}

const NON_COUNTING_STATUSES: ReadonlySet<FinanceTransactionStatus> = new Set([
  "REVERSED",
  "CANCELLED",
  "DECLINED",
])

/** Reversed, cancelled and declined movements never add to a total. */
export function isInactiveTransactionStatus(
  status: FinanceTransactionStatus
): boolean {
  return NON_COUNTING_STATUSES.has(status)
}

export function transactionInstrumentLabel(
  item: Pick<FinanceTransaction, "accountName" | "cardName">
): string | null {
  return item.cardName ?? item.accountName
}

export function transferDirectionLabel(
  item: Pick<
    FinanceTransaction,
    "accountName" | "cardName" | "transferToAccountName" | "transferToCardName"
  >
): string {
  const origin = item.accountName ?? item.cardName ?? "Origen"
  const destination =
    item.transferToAccountName ?? item.transferToCardName ?? "Destino"
  return `${origin} → ${destination}`
}

export function movementSign(
  transaction: Pick<FinanceTransaction, "type" | "ledgerAmount">
): "+" | "−" | null {
  if (transaction.type === "DEBIT") {
    return "−"
  }
  if (transaction.type === "CREDIT") {
    return "+"
  }
  if (transaction.type === "ADJUSTMENT") {
    const ledger = parseFinanceMoney(transaction.ledgerAmount)
    if (ledger !== null && ledger < 0) {
      return "−"
    }
    return "+"
  }
  return null
}

export function signedAmount(
  transaction: FinanceTransaction,
  display: FinanceMoneyDisplay
): string {
  const parsed = parseFinanceMoney(transaction.amount)
  const formatted = formatFinanceMoney(
    parsed === null ? null : Math.abs(parsed),
    { ...display, currency: transaction.currency }
  )
  if (isTransferTransaction(transaction)) {
    return formatted
  }
  const sign = movementSign(transaction)
  if (!sign) {
    return formatted
  }
  return `${sign} ${formatted}`
}

export function visibleTransactionTotals(
  items: Pick<
    FinanceTransaction,
    "type" | "amountBaseCurrency" | "transferGroupId" | "status" | "legs"
  >[]
): { income: number; expenses: number } {
  return items.reduce(
    (totals, item) => {
      for (const leg of item.legs ?? []) {
        if (leg.legRole !== "FEE" || isInactiveTransactionStatus(leg.status)) {
          continue
        }
        const fee = parseFinanceMoney(leg.amountBaseCurrency)
        if (fee === null) {
          continue
        }
        totals.expenses += fee
      }
      if (
        isTransferTransaction(item) ||
        isInactiveTransactionStatus(item.status)
      ) {
        return totals
      }
      const amount = parseFinanceMoney(item.amountBaseCurrency)
      if (amount === null) {
        return totals
      }
      if (item.type === "CREDIT") {
        totals.income += amount
      }
      if (item.type === "DEBIT") {
        totals.expenses += amount
      }
      return totals
    },
    { income: 0, expenses: 0 }
  )
}

export function timelineMonthQueryKey(month: MonthKey) {
  return [
    ...FINANCE_TRANSACTIONS_QUERY_KEY,
    "timeline",
    "month",
    month,
  ] as const
}

export function timelineMonthQuery(
  month: MonthKey,
  get: (path: string) => Promise<unknown>
) {
  const parsed = parseMonthKey(month)
  const bounds = isoMonthBounds(parsed.year, parsed.month)
  return {
    queryKey: timelineMonthQueryKey(month),
    staleTime: FINANCE_TIMELINE_STALE_TIME_MS,
    queryFn: () =>
      fetchAllTransactionPages(
        {
          dateFrom: bounds.dateFrom,
          dateTo: bounds.dateTo,
          limit: FINANCE_TIMELINE_PAGE_SIZE,
        },
        get
      ),
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

export async function fetchAllTransactionPages(
  query: Omit<FinanceTransactionsQuery, "cursor">,
  get: (path: string) => Promise<unknown>
): Promise<FinanceTransaction[]> {
  const items: FinanceTransaction[] = []
  let cursor: string | undefined
  let pages = 0
  do {
    const search = buildTransactionsSearchParams({ ...query, cursor })
    const payload = await get(`/finance/transactions?${search}`)
    const listed = transactionsFromPayload(payload)
    items.push(...listed.items)
    cursor = listed.nextCursor ?? undefined
    pages += 1
  } while (cursor && pages < FINANCE_TIMELINE_MAX_PAGES)
  return items
}
