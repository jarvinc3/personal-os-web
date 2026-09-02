import type {
  FinanceAccountType,
  FinanceCardNetwork,
  FinanceCardType,
} from "@/src/modules/finance/constants/catalog"

export const FINANCE_TRANSACTION_TYPES = ["DEBIT", "CREDIT", "TRANSFER"] as const
export type FinanceTransactionType = (typeof FINANCE_TRANSACTION_TYPES)[number]

export const FINANCE_TRANSACTION_TYPE_LABEL: Record<FinanceTransactionType, string> = {
  DEBIT: "Gasto",
  CREDIT: "Ingreso",
  TRANSFER: "Transferencia",
}

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
  ledgerCurrency: string | null
  amountBaseCurrency: string
  exchangeRate: string | null
  accountId: string | null
  accountName: string | null
  cardId: string | null
  cardName: string | null
  categoryId: string | null
  merchant: string | null
  notes: string | null
  source: string | null
  transactionDate: string
  description: string | null
  transferGroupId: string | null
}

export type FinanceTransferResult = {
  transferGroupId: string
  debit: FinanceTransaction
  credit: FinanceTransaction
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
  institutionId: string
  institutionName: string | null
  name: string
  type: FinanceAccountType
  currency: string
  balance: string
  color: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type FinanceCardBalance = {
  id: string
  currency: string
  balance: string
  creditLimit: string | null
}

export type FinanceCard = {
  id: string
  institutionId: string
  institutionName: string
  accountId: string | null
  accountName: string | null
  name: string
  type: FinanceCardType
  network: FinanceCardNetwork | null
  lastFour: string | null
  statementClosingDay: number | null
  paymentDueDay: number | null
  color: string | null
  isActive: boolean
  balances: FinanceCardBalance[]
}

export type FinanceInstitution = {
  id: string
  name: string
  color: string | null
  logoUrl: string | null
  country: string | null
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

export type FinanceBudgetStatus = {
  id: string
  categoryId: string
  category: string
  periodType: string
  periodStart: string
  periodEnd: string
  amountLimit: string
  amountSpent: string
  pctUsed: number
  threshold: number
}
