import {
  FINANCE_TRANSACTIONS_QUERY_KEY,
  type FinancePaginated,
} from "../types/api.ts"
import { isoMonthBounds, parseMonthKey, type MonthKey } from "./month-window.ts"
import type {
  FinanceTransaction,
  FinanceTransactionStatus,
  FinanceTransactionType,
} from "../types/entities.ts"
import { formatCalendarDate } from "./ledger-form.ts"
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
  page: number
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
    page: String(query.page),
    limit: String(query.limit),
  })
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
    pagination: {
      page: 1,
      limit: FINANCE_TX_PAGE_SIZE,
      total: 0,
      totalPages: 1,
    },
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return empty
  }
  const record = payload as {
    items?: unknown
    pagination?: Partial<FinancePaginated<FinanceTransaction>["pagination"]>
  }
  if (!Array.isArray(record.items)) {
    return empty
  }
  const pagination = record.pagination
  return {
    items: record.items as FinanceTransaction[],
    pagination: {
      page: Number(pagination?.page) || 1,
      limit: Number(pagination?.limit) || FINANCE_TX_PAGE_SIZE,
      total: Number(pagination?.total) || 0,
      totalPages: Number(pagination?.totalPages) || 1,
    },
  }
}

export function formatTransactionDate(value: string): string {
  return formatCalendarDate(value)
}

export function canReverseTransaction(
  tx: Pick<FinanceTransaction, "status" | "transferGroupId" | "type">
): boolean {
  if (tx.transferGroupId || tx.type === "TRANSFER") return false
  return tx.status === "CONFIRMED"
}

export function isTransferTransaction(
  item: Pick<FinanceTransaction, "type" | "transferGroupId">
): boolean {
  return item.type === "TRANSFER" || Boolean(item.transferGroupId)
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
  if (transaction.type === "DEBIT") return "−"
  if (transaction.type === "CREDIT") return "+"
  if (transaction.type === "ADJUSTMENT") {
    const ledger = parseFinanceMoney(transaction.ledgerAmount)
    if (ledger !== null && ledger < 0) return "−"
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
    "type" | "amountBaseCurrency" | "transferGroupId"
  >[]
): { income: number; expenses: number } {
  return items.reduce(
    (totals, item) => {
      if (isTransferTransaction(item)) return totals
      const amount = parseFinanceMoney(item.amountBaseCurrency)
      if (amount === null) return totals
      if (item.type === "CREDIT") totals.income += amount
      if (item.type === "DEBIT") totals.expenses += amount
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
  query: Omit<FinanceTransactionsQuery, "page">,
  get: (path: string) => Promise<unknown>
): Promise<FinanceTransaction[]> {
  const items: FinanceTransaction[] = []
  let page = 1
  let totalPages = 1
  while (page <= totalPages && page <= FINANCE_TIMELINE_MAX_PAGES) {
    const search = buildTransactionsSearchParams({ ...query, page })
    const payload = await get(`/finance/transactions?${search}`)
    const listed = transactionsFromPayload(payload)
    items.push(...listed.items)
    totalPages = listed.pagination.totalPages
    page += 1
  }
  return items
}
