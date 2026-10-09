import type { ModuleSlug } from "@/src/modules/settings/types/module-config.types"

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
    financeAccounts: "/finance/accounts",
    financeCategories: "/finance/accounts/categories",
    financeSync: "/finance/accounts/sync",
    financeInstitution: (institutionId: string) =>
      `/finance/accounts/institutions/${institutionId}`,
    financeAccount: (accountId: string) => `/finance/accounts/${accountId}`,
    financeCard: (cardId: string) => `/finance/accounts/cards/${cardId}`,
    financeTransactions: "/finance/transactions",
    financeTransactionNew: "/finance/transactions/new",
    financeTransactionEdit: (transactionId: string) =>
      `/finance/transactions/${transactionId}/edit`,
    financeTransferNew: "/finance/transfers/new",
    financePlanning: "/finance/planning",
    settingsFinanceCurrencies: "/settings/finance/currencies",
  },
} as const

export function financeTransactionNewHref(type: "DEBIT" | "CREDIT"): string {
  const params = new URLSearchParams({ type })
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
