import type { FinancePaginated } from "@/src/modules/finance/shared/types/api"
import type { FinanceBudget } from "@/src/modules/finance/shared/types/entities"
import { formatCalendarDate } from "./ledger-form.ts"

export const FINANCE_BUDGET_PAGE_SIZE = 20

export type FinanceBudgetsQuery = {
  cursor?: string
  limit: number
}

export function buildBudgetsSearchParams(query: FinanceBudgetsQuery): string {
  const params = new URLSearchParams({ limit: String(query.limit) })
  if (query.cursor) {
    params.set("cursor", query.cursor)
  }
  return params.toString()
}

export function budgetsFromPayload(
  payload: unknown
): FinancePaginated<FinanceBudget> {
  const empty: FinancePaginated<FinanceBudget> = {
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
    items: record.items as FinanceBudget[],
    nextCursor:
      typeof record.nextCursor === "string" ? record.nextCursor : null,
    hasMore: record.hasMore === true,
  }
}

export function formatBudgetPeriodDate(value: string, locale: string): string {
  return formatCalendarDate(value, locale)
}
