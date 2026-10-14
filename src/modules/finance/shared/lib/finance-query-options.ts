import {
  FINANCE_ACCOUNTS_QUERY_KEY,
  FINANCE_BUDGETS_QUERY_KEY,
  FINANCE_CARDS_QUERY_KEY,
  FINANCE_CATEGORIES_QUERY_KEY,
  FINANCE_EMAIL_MAILBOXES_QUERY_KEY,
  FINANCE_EMAIL_MESSAGES_QUERY_KEY,
  FINANCE_EMAIL_PENDING_QUERY_KEY,
  FINANCE_INSTITUTIONS_QUERY_KEY,
  FINANCE_LOANS_QUERY_KEY,
  FINANCE_RECEIVABLES_QUERY_KEY,
  FINANCE_SAVINGS_GOALS_QUERY_KEY,
  type FinancePaginated,
} from "@/src/modules/finance/shared/types/api"
import type {
  FinanceAccount,
  FinanceBudget,
  FinanceCard,
  FinanceCategory,
  FinanceEmailProcessedMessage,
  FinanceInstitution,
  FinanceLoan,
  FinanceMailbox,
  FinancePendingEmailMessage,
  FinanceReceivable,
  FinanceSavingsGoal,
} from "@/src/modules/finance/shared/types/entities"
import { asFinanceArray } from "./planning-lists.ts"

export type FinanceQueryGet = <T = unknown>(path: string) => Promise<T>

/** Default page size for the finance lists that grow with the user's data. */
export const FINANCE_LIST_PAGE_SIZE = 20

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
  emailMessages: "/finance/email-sync/messages",
} as const

export type FinanceListParams = Record<
  string,
  string | number | boolean | undefined | null
>

export type FinanceListPage = {
  items: readonly unknown[]
  nextCursor: string | null
  hasMore: boolean
}

/** Path of one cursor page, with the cursor kept out of the caller's params. */
export function buildFinanceListPath(input: {
  endpoint: string
  params?: FinanceListParams
  cursor: string | undefined
}): string {
  const callerParams = input.params ?? {}
  const params = Object.fromEntries(
    Object.entries(callerParams).filter(([key]) => key !== "cursor")
  )
  const path = buildFinanceQueryPath({ endpoint: input.endpoint, params })
  if (!input.cursor) {
    return path
  }
  const separator = path.includes("?") ? "&" : "?"
  return `${path}${separator}cursor=${encodeURIComponent(input.cursor)}`
}

/** Endpoint plus only the defined params, for reads without a cursor. */
export function buildFinanceQueryPath(input: {
  endpoint: string
  params?: FinanceListParams
}): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(input.params ?? {})) {
    if (value === undefined || value === null || value === "") {
      continue
    }
    search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `${input.endpoint}?${query}` : input.endpoint
}

/** Shared option builder for `useInfiniteQuery` over a cursor-paginated list. */
export function financeInfiniteListQuery<TPage extends FinanceListPage>({
  queryKey,
  endpoint,
  params,
  get = defaultFinanceGet,
}: {
  queryKey: readonly unknown[]
  endpoint: string
  params?: FinanceListParams
  get?: FinanceQueryGet
}) {
  return {
    queryKey,
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      get<TPage>(buildFinanceListPath({ endpoint, params, cursor: pageParam })),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: TPage) => lastPage.nextCursor ?? undefined,
  }
}

/** Every loaded row of an infinite query, in page order. */
export function infiniteListItems<TPage extends { items: readonly unknown[] }>(
  data: { pages: readonly TPage[] } | undefined
): TPage["items"] {
  return data?.pages.flatMap((page) => page.items) ?? ([] as TPage["items"])
}

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

export function budgetsInfiniteQuery(
  query: { limit: number },
  get: FinanceQueryGet = defaultFinanceGet
) {
  return financeInfiniteListQuery<FinancePaginated<FinanceBudget>>({
    queryKey: [...FINANCE_BUDGETS_QUERY_KEY, "infinite", query],
    endpoint: PATHS.budgets,
    params: { limit: query.limit },
    get,
  })
}

export function emailMailboxesQuery(get: FinanceQueryGet = defaultFinanceGet) {
  return {
    queryKey: FINANCE_EMAIL_MAILBOXES_QUERY_KEY,
    queryFn: async () =>
      asFinanceArray<FinanceMailbox>(await get(PATHS.emailMailboxes)),
  }
}

export function emailPendingQuery(get: FinanceQueryGet = defaultFinanceGet) {
  return financeInfiniteListQuery<FinancePaginated<FinancePendingEmailMessage>>(
    {
      queryKey: FINANCE_EMAIL_PENDING_QUERY_KEY,
      endpoint: PATHS.emailPending,
      params: { limit: FINANCE_LIST_PAGE_SIZE },
      get,
    }
  )
}

export function emailMessagesQuery(get: FinanceQueryGet = defaultFinanceGet) {
  return financeInfiniteListQuery<
    FinancePaginated<FinanceEmailProcessedMessage>
  >({
    queryKey: FINANCE_EMAIL_MESSAGES_QUERY_KEY,
    endpoint: PATHS.emailMessages,
    params: { limit: FINANCE_LIST_PAGE_SIZE },
    get,
  })
}
