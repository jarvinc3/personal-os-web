export const FINANCE_TRANSACTION_TYPES = ["DEBIT", "CREDIT", "TRANSFER"] as const
export type FinanceTransactionType = (typeof FINANCE_TRANSACTION_TYPES)[number]

export const FINANCE_TRANSACTION_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "DECLINED",
  "CANCELLED",
  "REVERSED",
] as const
export type FinanceTransactionStatus = (typeof FINANCE_TRANSACTION_STATUSES)[number]

/** UI copy: there is no COMPLETED enum. "Completado" maps to CONFIRMED. */
export const FINANCE_TRANSACTION_STATUS_LABEL: Record<FinanceTransactionStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Completado",
  DECLINED: "Rechazado",
  CANCELLED: "Cancelado",
  REVERSED: "Reversado",
}

export type FinanceTransaction = {
  id: string
  type: FinanceTransactionType
  status: FinanceTransactionStatus
  amount: string
  currency: string
  ledgerAmount: string
  ledgerCurrency: string
  amountBaseCurrency: string
  exchangeRate: string | null
  accountId: string | null
  cardId: string | null
  categoryId: string | null
  transactionDate: string
  description: string | null
  transferGroupId: string | null
}

export type FinanceAnalyticsSummary = {
  baseCurrency: string
  netWorth: string
  cashFlow: string
  totals: {
    accountBalance: string
    cardDebt: string
    income: string
    expenses: string
  }
}

export type FinanceSpendingPoint = {
  date: string
  expenses: string
  income: string
}

export type FinanceSpendingOverTime = {
  points: FinanceSpendingPoint[]
}

export type FinanceSpendingBucket = {
  categoryId: string | null
  name: string
  color: string | null
  icon: string | null
  total: string
}

export type FinanceAccount = {
  id: string
  name: string
  type: string
  currency: string
  balance: string
  isActive: boolean
}

export type FinanceCard = {
  id: string
  name: string
  isActive: boolean
}

export type FinanceInstitution = {
  id: string
  name: string
  isActive: boolean
}

export type FinanceCategory = {
  id: string
  name: string
  icon: string | null
  color: string | null
  parentId: string | null
  isSystem: boolean
}

export type FinanceBudget = {
  id: string
  amountLimit: string
  amountSpent: string
  pctUsed: number
  alertThresholdPct: number | null
}
