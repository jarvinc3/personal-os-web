import type { ModuleSlug } from "@/src/shared/types/module-nav"

const FINANCE_INSTITUTIONS_PATH = "/finance/institutions"
const FINANCE_CASH_PATH = "/finance/cash"

export const APP_ROUTES = {
  root: "/",
  auth: {
    login: "/login",
    verifyEmail: "/verify-email",
    callback: "/auth/callback",
  },
  app: {
    home: "/home",
    settings: "/settings",
    settingsAccount: "/settings/account",
    settingsRegional: "/settings/regional",
    settingsAppearance: "/settings/appearance",
    settingsAppearanceCards: "/settings/appearance/cards",
    settingsAppearanceCardEntity: (entitySlug: string) =>
      `/settings/appearance/cards/${entitySlug}`,
    settingsAppearanceComponents: "/settings/appearance/components",
    settingsAppearanceComponentSection: (sectionId: string) =>
      `/settings/appearance/components/${sectionId}`,
    settingsNotifications: "/settings/notifications",
    settingsPrivacy: "/settings/privacy",
    settingsModules: "/settings/modules",
    settingsWipeData: "/settings/wipe-data",
    help: "/help",
    helpGlossary: "/help/glossary",
    helpGuides: "/help/guides",
    helpGuide: (slug: string) => `/help/guides/${slug}`,
    helpFaq: "/help/faq",
    notifications: "/notifications",
    keepAwake: "/keep-awake",
    agenda: "/agenda",
    projects: "/projects",
    health: "/health",
    intelligence: "/intelligence",
    intelligenceKnowledge: "/intelligence/knowledge",
    intelligenceAdminRoles: "/intelligence/admin/roles",
    intelligenceAdminKnowledge: "/intelligence/admin/knowledge",
    finance: "/finance",
    financeOverview: "/finance/overview",
    financeStatistics: "/finance/statistics",
    financeProducts: "/finance/products",
    financeWealth: "/finance/wealth",
    financeInstitutions: FINANCE_INSTITUTIONS_PATH,
    financeCash: FINANCE_CASH_PATH,
    financeCategories: "/finance/categories",
    financeBankCharges: "/finance/bank-charges",
    financeRecycleBin: "/finance/recycle-bin",
    financeInstitution: (institutionId: string) =>
      `${FINANCE_INSTITUTIONS_PATH}/${institutionId}`,
    financeInstitutionNew: `${FINANCE_INSTITUTIONS_PATH}/new`,
    financeInstitutionEdit: (institutionId: string) =>
      `${FINANCE_INSTITUTIONS_PATH}/${institutionId}/edit`,
    financeInstitutionAccount: (institutionId: string, accountId: string) =>
      `${FINANCE_INSTITUTIONS_PATH}/${institutionId}/accounts/${accountId}`,
    financeInstitutionCard: (institutionId: string, cardId: string) =>
      `${FINANCE_INSTITUTIONS_PATH}/${institutionId}/cards/${cardId}`,
    financeCardNew: "/finance/cards/new",
    financeCardEdit: (cardId: string) => `/finance/cards/${cardId}/edit`,
    financeCashAccount: (accountId: string) =>
      `${FINANCE_CASH_PATH}/${accountId}`,
    financeTransactions: "/finance/transactions",
    financeTransaction: (transactionId: string) =>
      `/finance/transactions/${transactionId}`,
    financeTransactionNew: "/finance/transactions/new",
    financeTransactionEdit: (transactionId: string) =>
      `/finance/transactions/${transactionId}/edit`,
    financeTransferNew: "/finance/transfers/new",
    financeTransferEdit: (transactionId: string) =>
      `/finance/transfers/${transactionId}/edit`,
    financePlanning: "/finance/planning",
    financeLoans: "/finance/loans",
    financeLoanNew: "/finance/loans/new",
    financeLoan: (loanId: string) => `/finance/loans/${loanId}`,
    financeLoanEdit: (loanId: string) => `/finance/loans/${loanId}/edit`,
    financeBudget: (budgetId: string) => `/finance/budgets/${budgetId}`,
    financeBudgets: "/finance/budgets",
    financeSavingsGoals: "/finance/savings-goals",
    financeSavingsGoal: (goalId: string) => `/finance/savings-goals/${goalId}`,
    financeReceivables: "/finance/receivables",
    financeReceivable: (receivableId: string) =>
      `/finance/receivables/${receivableId}`,
    financeStatementImport: (importId: string) =>
      `/finance/statement-imports/${importId}`,
    financeMerchants: "/finance/merchants",
    financeMerchant: (merchantId: string) => `/finance/merchants/${merchantId}`,
    financeSubscriptions: "/finance/subscriptions",
    financeSubscriptionsCalendar: "/finance/subscriptions/calendar",
    financeSubscription: (subscriptionId: string) =>
      `/finance/subscriptions/${subscriptionId}`,
    settingsFinanceCurrencies: "/settings/finance/currencies",
  },
} as const

export function financeTransactionNewHref({
  type,
  destination,
  returnTo,
}: {
  type: "DEBIT" | "CREDIT"
  destination?: string
  returnTo?: string
}): string {
  const params = new URLSearchParams({ type })
  const target = destination?.trim()
  if (target) {
    params.set("destination", target)
  }
  const back = internalReturnPath(returnTo)
  if (back) {
    params.set("returnTo", back)
  }
  return `${APP_ROUTES.app.financeTransactionNew}?${params.toString()}`
}

/** Same-origin path accepted as "return here" after an action, or null. */
export function internalReturnPath(
  value: string | null | undefined
): string | null {
  const path = value?.trim() ?? ""
  if (!path.startsWith("/") || path.startsWith("//")) {
    return null
  }
  return path
}

const FINANCE_TRANSFER_FORM_TYPE = "TRANSFER"

export function isFinanceTransferFormType(type: unknown): boolean {
  if (typeof type !== "string") {
    return false
  }
  return type.trim().toUpperCase() === FINANCE_TRANSFER_FORM_TYPE
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
