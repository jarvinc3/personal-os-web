import {
  FINANCE_ACCOUNTS_QUERY_KEY,
  FINANCE_BUDGETS_QUERY_KEY,
  FINANCE_CARDS_QUERY_KEY,
  FINANCE_CATEGORIES_QUERY_KEY,
  FINANCE_EMAIL_MAILBOXES_QUERY_KEY,
  FINANCE_EMAIL_PENDING_QUERY_KEY,
  FINANCE_INSTITUTIONS_QUERY_KEY,
  FINANCE_LOANS_QUERY_KEY,
  FINANCE_RECEIVABLES_QUERY_KEY,
  FINANCE_SAVINGS_GOALS_QUERY_KEY,
  type FinancePaginated,
} from "../types/api.ts"
import type {
  FinanceAccount,
  FinanceBudget,
  FinanceCard,
  FinanceCategory,
  FinanceInstitution,
  FinanceLoan,
  FinanceMailbox,
  FinancePendingEmailMessage,
  FinanceReceivable,
  FinanceSavingsGoal,
} from "../types/entities.ts"
import {
  buildBudgetsSearchParams,
  type FinanceBudgetsQuery,
} from "./budgets-query.ts"
import { asFinanceArray } from "./planning-lists.ts"

export type FinanceQueryGet = <T = unknown>(path: string) => Promise<T>

async function defaultFinanceGet<T = unknown>(path: string): Promise<T> {
  const { apiGet } = await import("@/src/config/api-client")
  return apiGet<T>(path)
}

const PATHS = {
  accounts: "/finance/accounts",
  institutions: "/finance/institutions",
  cards: "/finance/cards",
  categories: "/finance/categories",
  savingsGoals: "/finance/savings-goals",
  loans: "/finance/loans",
  receivables: "/finance/receivables",
  budgets: "/finance/budgets",
  emailMailboxes: "/finance/email-sync/mailboxes",
  emailPending: "/finance/email-sync/pending",
} as const

export function categoriesQuery(get: FinanceQueryGet = defaultFinanceGet) {
  return {
    queryKey: FINANCE_CATEGORIES_QUERY_KEY,
    queryFn: () => get<FinanceCategory[]>(PATHS.categories),
  }
}

export function accountsQuery(get: FinanceQueryGet = defaultFinanceGet) {
  return {
    queryKey: FINANCE_ACCOUNTS_QUERY_KEY,
    queryFn: () => get<FinanceAccount[]>(PATHS.accounts),
  }
}

export function institutionsQuery(get: FinanceQueryGet = defaultFinanceGet) {
  return {
    queryKey: FINANCE_INSTITUTIONS_QUERY_KEY,
    queryFn: () => get<FinanceInstitution[]>(PATHS.institutions),
  }
}

export function cardsQuery(get: FinanceQueryGet = defaultFinanceGet) {
  return {
    queryKey: FINANCE_CARDS_QUERY_KEY,
    queryFn: () => get<FinanceCard[]>(PATHS.cards),
  }
}

export function savingsGoalsQuery(get: FinanceQueryGet = defaultFinanceGet) {
  return {
    queryKey: FINANCE_SAVINGS_GOALS_QUERY_KEY,
    queryFn: async () =>
      asFinanceArray<FinanceSavingsGoal>(await get(PATHS.savingsGoals)),
  }
}

export function loansQuery(get: FinanceQueryGet = defaultFinanceGet) {
  return {
    queryKey: FINANCE_LOANS_QUERY_KEY,
    queryFn: async () => asFinanceArray<FinanceLoan>(await get(PATHS.loans)),
  }
}

export function receivablesQuery(get: FinanceQueryGet = defaultFinanceGet) {
  return {
    queryKey: FINANCE_RECEIVABLES_QUERY_KEY,
    queryFn: async () =>
      asFinanceArray<FinanceReceivable>(await get(PATHS.receivables)),
  }
}

export function budgetsListQuery(
  query: FinanceBudgetsQuery,
  get: FinanceQueryGet = defaultFinanceGet,
) {
  const search = buildBudgetsSearchParams(query)
  return {
    queryKey: [...FINANCE_BUDGETS_QUERY_KEY, "list", query] as const,
    queryFn: () =>
      get<FinancePaginated<FinanceBudget>>(`${PATHS.budgets}?${search}`),
  }
}

export function emailMailboxesQuery(get: FinanceQueryGet = defaultFinanceGet) {
  return {
    queryKey: FINANCE_EMAIL_MAILBOXES_QUERY_KEY,
    queryFn: async () =>
      asFinanceArray<FinanceMailbox>(await get(PATHS.emailMailboxes)),
  }
}

export function emailPendingQuery(get: FinanceQueryGet = defaultFinanceGet) {
  return {
    queryKey: FINANCE_EMAIL_PENDING_QUERY_KEY,
    queryFn: async () =>
      asFinanceArray<FinancePendingEmailMessage>(await get(PATHS.emailPending)),
  }
}
