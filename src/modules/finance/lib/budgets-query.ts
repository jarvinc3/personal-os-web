import type { FinancePaginated } from "../types/api.ts"
import type { FinanceBudget } from "../types/entities.ts"

export const FINANCE_BUDGET_PAGE_SIZE = 20

export type FinanceBudgetsQuery = {
  page: number
  limit: number
}

export function buildBudgetsSearchParams(query: FinanceBudgetsQuery): string {
  return new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
  }).toString()
}

export function budgetsFromPayload(
  payload: unknown,
): FinancePaginated<FinanceBudget> {
  const empty: FinancePaginated<FinanceBudget> = {
    items: [],
    pagination: {
      page: 1,
      limit: FINANCE_BUDGET_PAGE_SIZE,
      total: 0,
      totalPages: 1,
    },
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return empty
  }
  const record = payload as {
    items?: unknown
    pagination?: Partial<FinancePaginated<FinanceBudget>["pagination"]>
  }
  if (!Array.isArray(record.items)) {
    return empty
  }
  const pagination = record.pagination
  return {
    items: record.items as FinanceBudget[],
    pagination: {
      page: Number(pagination?.page) || 1,
      limit: Number(pagination?.limit) || FINANCE_BUDGET_PAGE_SIZE,
      total: Number(pagination?.total) || 0,
      totalPages: Number(pagination?.totalPages) || 1,
    },
  }
}

export function formatBudgetPeriodDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10)
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
