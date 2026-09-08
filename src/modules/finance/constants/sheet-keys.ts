export const FINANCE_SHEET_KEYS = {
  institution: "institution-sheet",
  institutionOptions: "institution-options-sheet",
  account: "account-sheet",
  cashAccountOptions: "cash-account-options-sheet",
  card: "card-sheet",
  cardBalance: "card-balance-sheet",
  loan: "loan-sheet",
  category: "category-sheet",
  transactionFilters: "transaction-filters-sheet",
  transactionDetail: "transaction-detail-sheet",
  transaction: "transaction-sheet",
  transfer: "transfer-sheet",
  savings: "savings-sheet",
  receivable: "receivable-sheet",
  budget: "budget-sheet",
  connectGmail: "connect-gmail-sheet",
  emailSource: "email-source-sheet",
  assignEmail: "assign-email-sheet",
} as const

export type FinanceSheetKey =
  (typeof FINANCE_SHEET_KEYS)[keyof typeof FINANCE_SHEET_KEYS]
