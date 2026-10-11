import type { ModuleSlug } from "@/src/shared/types/module-nav"

const FINANCE_INSTITUTIONS_PATH = "/finance/institutions"
const FINANCE_CASH_PATH = "/finance/cash"

export const APP_ROUTES = {
  root: "/",
  marketing: {
    landing: "/landing",
  },
  auth: {
    login: "/login",
    verifyEmail: "/verify-email",
    callback: "/auth/callback",
  },
  app: {
    home: "/home",
    settings: "/settings",
    settingsWipeData: "/settings/wipe-data",
    chat: "/chat",
    notifications: "/notifications",
    keepAwake: "/keep-awake",
    finance: "/finance",
    financeProducts: "/finance/products",
    financeInstitutions: FINANCE_INSTITUTIONS_PATH,
    financeCash: FINANCE_CASH_PATH,
    financeCategories: "/finance/categories",
    financeSync: "/finance/sync",
    financeInstitution: (institutionId: string) =>
      `${FINANCE_INSTITUTIONS_PATH}/${institutionId}`,
    financeInstitutionAccount: (institutionId: string, accountId: string) =>
      `${FINANCE_INSTITUTIONS_PATH}/${institutionId}/accounts/${accountId}`,
    financeInstitutionCard: (institutionId: string, cardId: string) =>
      `${FINANCE_INSTITUTIONS_PATH}/${institutionId}/cards/${cardId}`,
    financeCashAccount: (accountId: string) =>
      `${FINANCE_CASH_PATH}/${accountId}`,
    financeTransactions: "/finance/transactions",
    financeTransaction: (transactionId: string) =>
      `/finance/transactions/${transactionId}`,
    financeTransactionNew: "/finance/transactions/new",
    financeTransactionEdit: (transactionId: string) =>
      `/finance/transactions/${transactionId}/edit`,
    financeTransferNew: "/finance/transfers/new",
    financePlanning: "/finance/planning",
    financeLoans: "/finance/loans",
    financeLoan: (loanId: string) => `/finance/loans/${loanId}`,
    financeBudget: (budgetId: string) => `/finance/budgets/${budgetId}`,
    financeBudgets: "/finance/budgets",
    financeSavingsGoals: "/finance/savings-goals",
    financeSavingsGoal: (goalId: string) => `/finance/savings-goals/${goalId}`,
    financeReceivables: "/finance/receivables",
    financeReceivable: (receivableId: string) =>
      `/finance/receivables/${receivableId}`,
    settingsFinanceCurrencies: "/settings/finance/currencies",
  },
} as const

export function financeTransactionNewHref(
  type: "DEBIT" | "CREDIT",
  destination?: string
): string {
  const params = new URLSearchParams({ type })
  const target = destination?.trim()
  if (target) {
    params.set("destination", target)
  }
  return `${APP_ROUTES.app.financeTransactionNew}?${params.toString()}`
}

/** `CREDIT` only when the query is exactly that; everything else is a debit. */
export function parseTransactionFormType(
  type: string | null | undefined
): "DEBIT" | "CREDIT" {
  return type?.trim().toUpperCase() === "CREDIT" ? "CREDIT" : "DEBIT"
}

export function settingsModuleHref(slug: ModuleSlug): string {
  return `${APP_ROUTES.app.settings}/${slug}`
}

export function authVerifyEmailHref(email: string): string {
  const params = new URLSearchParams({ email })
  return `${APP_ROUTES.auth.verifyEmail}?${params.toString()}`
}
