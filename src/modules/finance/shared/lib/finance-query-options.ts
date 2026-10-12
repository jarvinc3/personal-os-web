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
  FINANCE_RECEIVABLE_PAYMENTS_QUERY_KEY,
  FINANCE_RECEIVABLES_QUERY_KEY,
  FINANCE_RECYCLE_BIN_QUERY_KEY,
  FINANCE_SAVINGS_GOAL_CONTRIBUTIONS_QUERY_KEY,
  FINANCE_SAVINGS_GOALS_QUERY_KEY,
  type FinancePaginated,
  type FinanceRecycleBin,
} from "@/src/modules/finance/shared/types/api"
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
  FinanceReceivablePayment,
  FinanceSavingsGoal,
  FinanceSavingsGoalContribution,
} from "@/src/modules/finance/shared/types/entities"
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
  savingsGoalContributions: (goalId: string) =>
    `/finance/savings-goals/${goalId}/contributions`,
  loans: "/finance/loans",
  loanInstallments: (loanId: string) => `/finance/loans/${loanId}/installments`,
  receivables: "/finance/receivables",
  receivablePayments: (receivableId: string) =>
    `/finance/receivables/${receivableId}/payments`,
  budgets: "/finance/budgets",
  recycleBin: "/finance/recycle-bin",
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

export function savingsGoalContributionsQuery(
  goalId: string,
  get: FinanceQueryGet = defaultFinanceGet
) {
  return {
    queryKey: [
      ...FINANCE_SAVINGS_GOAL_CONTRIBUTIONS_QUERY_KEY,
      goalId,
    ] as const,
    queryFn: async () =>
      asFinanceArray<FinanceSavingsGoalContribution>(
        await get(PATHS.savingsGoalContributions(goalId))
      ),
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

export function receivablePaymentsQuery(
  receivableId: string,
  get: FinanceQueryGet = defaultFinanceGet
) {
  return {
    queryKey: [...FINANCE_RECEIVABLE_PAYMENTS_QUERY_KEY, receivableId] as const,
    queryFn: async () =>
      asFinanceArray<FinanceReceivablePayment>(
        await get(PATHS.receivablePayments(receivableId))
      ),
  }
}

export function budgetsInfiniteQuery(
  query: FinanceBudgetsQuery,
  get: FinanceQueryGet = defaultFinanceGet
) {
  return {
    queryKey: [...FINANCE_BUDGETS_QUERY_KEY, "infinite", query] as const,
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      get<FinancePaginated<FinanceBudget>>(
        `${PATHS.budgets}?${buildBudgetsSearchParams({
          limit: query.limit,
          cursor: pageParam,
        })}`
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: FinancePaginated<FinanceBudget>) =>
      lastPage.nextCursor ?? undefined,
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

export function recycleBinQuery(get: FinanceQueryGet = defaultFinanceGet) {
  return {
    queryKey: FINANCE_RECYCLE_BIN_QUERY_KEY,
    queryFn: () => get<FinanceRecycleBin>(PATHS.recycleBin),
  }
}
