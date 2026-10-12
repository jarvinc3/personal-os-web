export const FINANCE_SHEET_KEYS = {
  institutionOptions: "institution-options-sheet",
  account: "account-sheet",
  accountBalance: "account-balance-sheet",
  cashAccountOptions: "cash-account-options-sheet",
  accountHistory: "account-history-sheet",
  cardOptions: "card-options-sheet",
  cardHistory: "card-history-sheet",
  cardBalance: "card-balance-sheet",
  cardPayment: "card-payment-sheet",
  loanOptions: "loan-options-sheet",
  category: "category-sheet",
  transactionOptions: "transaction-options-sheet",
  savings: "savings-sheet",
  savingsContribution: "savings-contribution-sheet",
  receivable: "receivable-sheet",
  receivablePayment: "receivable-payment-sheet",
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
