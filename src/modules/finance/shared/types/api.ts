/**
 * REST list shapes after `api-client` unwraps `{ data, meta }`.
 *
 * Cursor paginated `{ items, nextCursor, hasMore }` — GET /finance/transactions, GET /finance/budgets
 * Array — accounts, cards, institutions, categories, savings-goals, loans,
 *   receivables, email-sync/sources, spending-by-category, budget-status
 * Object — analytics/summary, balance-sheet
 * `{ points }` — analytics/spending-over-time
 *
 * Money fields on **read** are decimal strings. Write DTOs stay numbers.
 * `interestRate` read: string | null. Percentages (`pctUsed`, `alertThresholdPct`) stay number.
 */

export type FinancePaginated<T> = {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
}

export const FINANCE_QUERY_KEY = ["finance"] as const

export const FINANCE_INSTITUTIONS_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "institutions",
] as const
export const FINANCE_ACCOUNTS_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "accounts",
] as const
export const FINANCE_CURRENCIES_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "currencies",
] as const
export const FINANCE_EXCHANGE_RATES_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "exchange-rates",
] as const
export const FINANCE_CARDS_QUERY_KEY = [...FINANCE_QUERY_KEY, "cards"] as const
export const FINANCE_CARD_STATEMENTS_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "card-statements",
] as const
export const FINANCE_CATEGORIES_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "categories",
] as const
export const FINANCE_STATEMENT_IMPORTS_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "statement-imports",
] as const
export const FINANCE_ANALYTICS_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "analytics",
] as const
export const FINANCE_BALANCE_SHEET_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "balance-sheet",
] as const
export const FINANCE_TRANSACTIONS_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "transactions",
] as const
export const FINANCE_MERCHANTS_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "merchants",
] as const
export const FINANCE_RECURRING_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "recurring",
] as const
export const FINANCE_SUBSCRIPTIONS_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "subscriptions",
] as const
export const FINANCE_BUDGETS_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "budgets",
] as const
export const FINANCE_SAVINGS_GOALS_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "savings-goals",
] as const
export const FINANCE_LOANS_QUERY_KEY = [...FINANCE_QUERY_KEY, "loans"] as const
export const FINANCE_RECEIVABLES_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "receivables",
] as const
export const FINANCE_SAVINGS_GOAL_CONTRIBUTIONS_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "savings-goal-contributions",
] as const
export const FINANCE_RECEIVABLE_PAYMENTS_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "receivable-payments",
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
export const FINANCE_RECYCLE_BIN_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "recycle-bin",
] as const
export const FINANCE_INSTRUMENT_HISTORY_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "instrument-history",
] as const
export const FINANCE_RECONCILIATIONS_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "reconciliations",
] as const
export const FINANCE_RECONCILIATION_STATUS_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "reconciliation-status",
] as const
export const FINANCE_BANK_CHARGES_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "bank-charges",
] as const
export const FINANCE_INTEGRITY_QUERY_KEY = [
  ...FINANCE_QUERY_KEY,
  "integrity",
] as const

export type FinanceArchivedType = "institution" | "account" | "card" | "loan"

export type FinanceDeletedType =
  | "institution"
  | "account"
  | "card"
  | "loan"
  | "transaction"
  | "category"
  | "budget"
  | "savingsGoal"
  | "receivable"
  | "reconciliation"

export type FinanceArchivedRecord = {
  type: FinanceArchivedType
  id: string
  label: string
  logoUrl: string | null
}

export type FinanceDeletedRecord = {
  type: FinanceDeletedType
  id: string
  label: string | null
  deletedAt: string
  sizeBytes: number
}

export type FinanceRecycleBinPage = FinancePaginated<FinanceDeletedRecord> & {
  archived: FinanceArchivedRecord[]
}
