import {
  FINANCE_TRANSACTIONS_QUERY_KEY,
  type FinancePaginated,
} from "@/src/modules/finance/shared/types/api"
import { parseMonthKey, type MonthKey } from "./month-window.ts"
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

import {
  instantToZonedWallTime,
  zonedMonthEnd,
  zonedMonthStart,
} from "@/src/shared/lib/zoned-time"

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
function toUserWallClock(
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

export function formatTransactionDate(value: string, locale: string): string {
  return formatFinanceDateTimeLabel(value, locale)
}

export function canReverseTransaction(
  tx: Pick<FinanceTransaction, "status">
): boolean {
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

export const OPERATION_LEG_ROLE = {
  SOURCE: "SOURCE",
  DESTINATION: "DESTINATION",
  FEE: "FEE",
} as const

export type FinanceInstrumentRef = { accountId?: string; cardId?: string }

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

/**
 * Money a movement shows on the instrument it is read from. A cross-currency
 * transfer credits the destination with the received amount, not the source one.
 */
export function movementSideMoney(
  transaction: FinanceTransaction,
  instrument?: FinanceInstrumentRef
): { amount: string; currency: string } {
  const sourceSide = {
    amount: transaction.amount,
    currency: transaction.currency,
  }
  if (!instrument || !transaction.transferToAmount) {
    return sourceSide
  }
  if (!transaction.transferToCurrency) {
    return sourceSide
  }
  if (transferSignFromInstrument(transaction, instrument) !== "+") {
    return sourceSide
  }
  return {
    amount: transaction.transferToAmount,
    currency: transaction.transferToCurrency,
  }
}

export function signedAmount({
  transaction,
  display,
  instrument,
}: {
  transaction: FinanceTransaction
  display: FinanceMoneyDisplay
  instrument?: FinanceInstrumentRef
}): string {
  const side = movementSideMoney(transaction, instrument)
  const parsed = parseFinanceMoney(side.amount)
  const formatted = formatFinanceMoney(
    parsed === null ? null : Math.abs(parsed),
    {
      ...display,
      currency: side.currency,
    }
  )
  const sign = displayedMovementSign(transaction, instrument)
  if (!sign) {
    return formatted
  }
  return `${sign} ${formatted}`
}

/** Sign of a row: a transfer depends on the account or card it is read from. */
export function displayedMovementSign(
  transaction: FinanceTransaction,
  instrument?: FinanceInstrumentRef
): "+" | "−" | null {
  if (!isTransferTransaction(transaction)) {
    return movementSign(transaction)
  }
  if (!instrument) {
    return null
  }
  return transferSignFromInstrument(transaction, instrument)
}

function legMatchesInstrument(
  leg: FinanceTransaction,
  instrument: FinanceInstrumentRef
): boolean {
  if (instrument.accountId) {
    return leg.accountId === instrument.accountId
  }
  if (instrument.cardId) {
    return leg.cardId === instrument.cardId
  }
  return false
}

/** True when the movement moves money into or out of that account or card. */
export function movementTouchesInstrument(
  transaction: FinanceTransaction,
  instrument: FinanceInstrumentRef
): boolean {
  if (
    instrument.accountId &&
    (transaction.accountId === instrument.accountId ||
      transaction.transferToAccountId === instrument.accountId)
  ) {
    return true
  }
  if (
    instrument.cardId &&
    (transaction.cardId === instrument.cardId ||
      transaction.transferToCardId === instrument.cardId)
  ) {
    return true
  }
  return (transaction.legs ?? []).some((leg) =>
    legMatchesInstrument(leg, instrument)
  )
}

/** Sign of a transfer seen from one account or card: money out is negative. */
export function transferSignFromInstrument(
  transaction: FinanceTransaction,
  instrument: FinanceInstrumentRef
): "+" | "−" | null {
  const legs = transaction.legs ?? []
  if (
    legs.some(
      (leg) =>
        leg.legRole === OPERATION_LEG_ROLE.SOURCE &&
        legMatchesInstrument(leg, instrument)
    )
  ) {
    return "−"
  }
  if (
    legs.some(
      (leg) =>
        leg.legRole === OPERATION_LEG_ROLE.DESTINATION &&
        legMatchesInstrument(leg, instrument)
    )
  ) {
    return "+"
  }
  if (instrument.accountId) {
    if (transaction.accountId === instrument.accountId) {
      return "−"
    }
    if (transaction.transferToAccountId === instrument.accountId) {
      return "+"
    }
  }
  if (instrument.cardId) {
    if (transaction.cardId === instrument.cardId) {
      return "−"
    }
    if (transaction.transferToCardId === instrument.cardId) {
      return "+"
    }
  }
  return null
}

type TotalsSource = Pick<
  FinanceTransaction,
  | "type"
  | "amount"
  | "currency"
  | "amountBaseCurrency"
  | "transferGroupId"
  | "status"
  | "legs"
>

function amountForTotals(
  item: Pick<FinanceTransaction, "amount" | "currency" | "amountBaseCurrency">,
  currency?: string
): number | null {
  if (!currency) {
    return parseFinanceMoney(item.amountBaseCurrency)
  }
  if (item.currency !== currency) {
    return null
  }
  return parseFinanceMoney(item.amount)
}

export function visibleTransactionTotals(
  items: TotalsSource[],
  currency?: string
): { income: number; expenses: number } {
  return items.reduce(
    (totals, item) => {
      for (const leg of item.legs ?? []) {
        if (
          leg.legRole !== OPERATION_LEG_ROLE.FEE ||
          isInactiveTransactionStatus(leg.status)
        ) {
          continue
        }
        const fee = amountForTotals(leg, currency)
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
      const amount = amountForTotals(item, currency)
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
  do {
    const search = buildTransactionsSearchParams({ ...query, cursor })
    const payload = await get(`/finance/transactions?${search}`)
    const listed = transactionsFromPayload(payload, timeZone)
    items.push(...listed.items)
    cursor = listed.nextCursor ?? undefined
    pages += 1
  } while (cursor && pages < FINANCE_TIMELINE_MAX_PAGES)
  return items
}
