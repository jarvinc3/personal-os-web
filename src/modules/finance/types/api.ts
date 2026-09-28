/**
 * REST list shapes after `api-client` unwraps `{ data, meta }`.
 *
 * Paginated `{ items, pagination }` — GET /finance/transactions, GET /finance/budgets
 * Array — accounts, cards, institutions, categories, savings-goals, loans,
 *   receivables, email-sync/sources, spending-by-category, budget-status
 * Object — analytics/summary, balance-sheet
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

export const FINANCE_INSTITUTIONS_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "institutions",
] as const
export const FINANCE_ACCOUNTS_QUERY_KEY = [...FINANCE_QUERY_KEY, "accounts"] as const
export const FINANCE_CURRENCIES_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "currencies",
] as const
export const FINANCE_CARDS_QUERY_KEY = [...FINANCE_QUERY_KEY, "cards"] as const
export const FINANCE_CATEGORIES_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "categories",
] as const
export const FINANCE_ANALYTICS_QUERY_KEY = [...FINANCE_QUERY_KEY, "analytics"] as const
export const FINANCE_BALANCE_SHEET_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "balance-sheet",
] as const
export const FINANCE_TRANSACTIONS_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "transactions",
] as const
export const FINANCE_BUDGETS_QUERY_KEY = [...FINANCE_QUERY_KEY, "budgets"] as const
export const FINANCE_SAVINGS_GOALS_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "savings-goals",
] as const
export const FINANCE_LOANS_QUERY_KEY = [...FINANCE_QUERY_KEY, "loans"] as const
export const FINANCE_RECEIVABLES_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "receivables",
] as const
export const FINANCE_EMAIL_SOURCES_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "email-sources",
] as const
export const FINANCE_EMAIL_MAILBOXES_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "email-mailboxes",
] as const
export const FINANCE_EMAIL_PENDING_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "email-pending",
] as const
export const FINANCE_EMAIL_MESSAGES_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "email-messages",
] as const
