export const APP_ROUTES = {
  root: '/',
  marketing: {
    landing: '/landing',
  },
  auth: {
    login: '/login',
    verifyEmail: '/verify-email',
    callback: '/auth/callback',
  },
  app: {
    home: '/home',
    settings: '/settings',
    chat: '/chat',
    notifications: '/notifications',
    keepAwake: '/keep-awake',
    finance: '/finance',
    financeStatistics: '/finance/statistics',
    financeAccounts: '/finance/accounts',
    financeCategories: '/finance/accounts/categories',
    financeInstitution: (institutionId: string) =>
      `/finance/accounts/institutions/${institutionId}`,
    financeCashAccount: (accountId: string) =>
      `/finance/accounts/cash/${accountId}`,
    financeTransactions: '/finance/transactions',
    financeBudgets: '/finance/budgets',
    financePlanning: '/finance/planning',
    financeSync: '/finance/sync',
  },
} as const;

export function authVerifyEmailHref(email: string): string {
  const params = new URLSearchParams({ email });
  return `${APP_ROUTES.auth.verifyEmail}?${params.toString()}`;
}
