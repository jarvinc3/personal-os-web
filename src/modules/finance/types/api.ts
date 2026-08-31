/**
 * REST list shapes after `api-client` unwraps `{ data, meta }`.
 *
 * Paginated `{ items, pagination }` — GET /finance/transactions, GET /finance/budgets
 * Array — accounts, cards, institutions, categories, savings-goals, loans,
 *   receivables, email-sync/sources, spending-by-category, budget-status
 * Object — analytics/summary
 * `{ points }` — analytics/spending-over-time
 *
 * Money fields on **read** are decimal strings. Write DTOs stay numbers.
 * `interestRate` read: string | null. Percentages (`pctUsed`, `alertThresholdPct`) stay number.
 */

export type FinancePagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type FinancePaginated<T> = {
  items: T[]
  pagination: FinancePagination
}

export const FINANCE_QUERY_KEY = ["finance"] as const
