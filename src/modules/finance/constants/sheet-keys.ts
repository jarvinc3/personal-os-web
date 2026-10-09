export const FINANCE_SHEET_KEYS = {
  institution: "institution-sheet",
  institutionOptions: "institution-options-sheet",
  account: "account-sheet",
  accountBalance: "account-balance-sheet",
  cashAccountOptions: "cash-account-options-sheet",
  card: "card-sheet",
  cardBalance: "card-balance-sheet",
  loan: "loan-sheet",
  category: "category-sheet",
  transactionDetail: "transaction-detail-sheet",
  savings: "savings-sheet",
  receivable: "receivable-sheet",
  budget: "budget-sheet",
  connectGmail: "connect-gmail-sheet",
  emailSource: "email-source-sheet",
  assignEmail: "assign-email-sheet",
  oauthGmailResult: "oauth-gmail-result",
  linkInstitutionMailbox: "link-institution-mailbox-sheet",
  mailbox: "mailbox-sheet",
} as const

export type FinanceSheetKey =
  (typeof FINANCE_SHEET_KEYS)[keyof typeof FINANCE_SHEET_KEYS]
