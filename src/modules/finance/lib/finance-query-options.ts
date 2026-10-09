import {
  FINANCE_ACCOUNTS_QUERY_KEY,
  FINANCE_BUDGETS_QUERY_KEY,
  FINANCE_CARDS_QUERY_KEY,
  FINANCE_CARD_STATEMENTS_QUERY_KEY,
  FINANCE_CATEGORIES_QUERY_KEY,
  FINANCE_EMAIL_MAILBOXES_QUERY_KEY,
  FINANCE_EMAIL_MESSAGES_QUERY_KEY,
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
  FinanceCardStatement,
  FinanceCategory,
  FinanceInstitution,
  FinanceLoan,
  FinanceLoanInstallment,
  FinanceMailbox,
  FinancePendingEmailMessage,
  FinanceEmailProcessedMessage,
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
  cardStatements: (cardId: string) => `/finance/cards/${cardId}/statements`,
  categories: "/finance/categories",
  savingsGoals: "/finance/savings-goals",
  loans: "/finance/loans",
  loanInstallments: (loanId: string) => `/finance/loans/${loanId}/installments`,
  receivables: "/finance/receivables",
  budgets: "/finance/budgets",
  emailMailboxes: "/finance/email-sync/mailboxes",
  emailPending: "/finance/email-sync/pending",
  emailMessages: "/finance/email-sync/messages",
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

export function cardStatementsQuery(
  cardId: string,
  get: FinanceQueryGet = defaultFinanceGet
) {
  return {
    queryKey: [...FINANCE_CARD_STATEMENTS_QUERY_KEY, cardId] as const,
    queryFn: () => get<FinanceCardStatement[]>(PATHS.cardStatements(cardId)),
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

export function loanInstallmentsQuery(
  loanId: string,
  get: FinanceQueryGet = defaultFinanceGet
) {
  return {
    queryKey: [...FINANCE_LOANS_QUERY_KEY, "installments", loanId] as const,
    queryFn: async () =>
      asFinanceArray<FinanceLoanInstallment>(
        await get(PATHS.loanInstallments(loanId))
      ),
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
  get: FinanceQueryGet = defaultFinanceGet
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

export function emailMessagesQuery(get: FinanceQueryGet = defaultFinanceGet) {
  return {
    queryKey: FINANCE_EMAIL_MESSAGES_QUERY_KEY,
    queryFn: async () =>
      asFinanceArray<FinanceEmailProcessedMessage>(
        await get(PATHS.emailMessages)
      ),
  }
}
