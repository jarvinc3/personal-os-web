import type { FinancePaginated } from "../types/api.ts";
import type {
  FinanceTransaction,
  FinanceTransactionStatus,
  FinanceTransactionType,
} from "../types/entities.ts";
import { formatCalendarDate } from "./ledger-form.ts";
import { parseFinanceMoney } from "./money.ts";

export const FINANCE_TX_FILTER_ALL = "__all__" as const
export const FINANCE_TX_PAGE_SIZE = 20

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
  query: FinanceTransactionsQuery,
): string {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
  })
  for (const key of OPTIONAL_KEYS) {
    const value = query[key]
    if (typeof value === "string" && value.trim() && value !== FINANCE_TX_FILTER_ALL) {
      params.set(key, value.trim())
    }
  }
  return params.toString()
}

export function transactionsFromPayload(
  payload: unknown,
): FinancePaginated<FinanceTransaction> {
  const empty: FinancePaginated<FinanceTransaction> = {
    items: [],
    pagination: { page: 1, limit: FINANCE_TX_PAGE_SIZE, total: 0, totalPages: 1 },
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
  tx: Pick<FinanceTransaction, "status" | "transferGroupId" | "type">,
): boolean {
  if (tx.transferGroupId || tx.type === "TRANSFER") return false
  return tx.status === "CONFIRMED"
}

export function isTransferTransaction(
  item: Pick<FinanceTransaction, "type" | "transferGroupId">,
): boolean {
  return item.type === "TRANSFER" || Boolean(item.transferGroupId)
}

export function transferDirectionLabel(
  item: Pick<
    FinanceTransaction,
    | "accountName"
    | "cardName"
    | "transferToAccountName"
    | "transferToCardName"
  >,
): string {
  const origin = item.accountName ?? item.cardName ?? "Origen"
  const destination =
    item.transferToAccountName ?? item.transferToCardName ?? "Destino"
  return `${origin} → ${destination}`
}

export function visibleTransactionTotals(
  items: Pick<FinanceTransaction, "type" | "amount" | "transferGroupId">[],
): { income: number; expenses: number } {
  return items.reduce(
    (totals, item) => {
      if (isTransferTransaction(item)) return totals
      const amount = parseFinanceMoney(item.amount)
      if (amount === null) return totals
      if (item.type === "CREDIT") totals.income += amount
      if (item.type === "DEBIT") totals.expenses += amount
      return totals
    },
    { income: 0, expenses: 0 },
  )
}
