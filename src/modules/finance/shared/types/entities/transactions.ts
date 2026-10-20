export const FINANCE_TRANSACTION_TYPES = [
  "DEBIT",
  "CREDIT",
  "TRANSFER",
  "ADJUSTMENT",
] as const
export type FinanceTransactionType = (typeof FINANCE_TRANSACTION_TYPES)[number]

export const FINANCE_TRANSACTION_TYPE_LABEL: Record<
  FinanceTransactionType,
  string
> = {
  DEBIT: "Gasto",
  CREDIT: "Ingreso",
  TRANSFER: "Transferencia",
  ADJUSTMENT: "Reajuste",
}

export const FINANCE_CATEGORY_TYPES = ["EXPENSE", "INCOME"] as const
export type FinanceCategoryType = (typeof FINANCE_CATEGORY_TYPES)[number]

export const FINANCE_CATEGORY_TYPE_LABEL: Record<FinanceCategoryType, string> =
  {
    EXPENSE: "Gasto",
    INCOME: "Ingreso",
  }

export const FINANCE_TRANSACTION_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "DECLINED",
  "CANCELLED",
  "REVERSED",
] as const
export type FinanceTransactionStatus =
  (typeof FINANCE_TRANSACTION_STATUSES)[number]

/** UI copy: there is no COMPLETED enum. "Completado" maps to CONFIRMED. */
export const FINANCE_TRANSACTION_STATUS_LABEL: Record<
  FinanceTransactionStatus,
  string
> = {
  PENDING: "Pendiente",
  CONFIRMED: "Completado",
  DECLINED: "Rechazado",
  CANCELLED: "Cancelado",
  REVERSED: "Revertido",
}

export type FinanceTransactionEditability =
  "FULL" | "METADATA" | "NOTES" | "NONE"

export type FinanceInstrumentHistoryKind =
  "CREDIT_LIMIT_CHANGED" | "ADJUSTMENT" | "STATEMENT_CLOSED"

export type FinanceInstrumentHistoryItem = {
  id: string
  kind: FinanceInstrumentHistoryKind
  at: string
  amount: string | null
  currency: string | null
  payload: Record<string, unknown>
}

export type FinanceTransactionLinkKind =
  "LOAN_INSTALLMENT" | "RECEIVABLE_PAYMENT" | "SAVINGS_CONTRIBUTION"

export type FinanceTransactionPlanningLink = {
  kind: FinanceTransactionLinkKind
  targetId: string
  label: string
}

export type FinanceTransaction = {
  id: string
  type: FinanceTransactionType
  status: FinanceTransactionStatus
  editable: FinanceTransactionEditability
  amount: string
  currency: string
  ledgerAmount: string
  ledgerCurrency: string | null
  amountBaseCurrency: string
  exchangeRate: string | null
  accountId: string | null
  accountName: string | null
  institutionLogoUrl?: string | null
  cardId: string | null
  cardName: string | null
  network?: string | null
  networkLogoUrl?: string | null
  transferToInstitutionLogoUrl?: string | null
  transferToNetwork?: string | null
  transferToNetworkLogoUrl?: string | null
  categoryId: string | null
  merchant: string | null
  merchantId?: string | null
  merchantName?: string | null
  merchantLogoUrl?: string | null
  notes: string | null
  source: string | null
  transactionDate: string
  description: string | null
  transferGroupId: string | null
  transferToAccountId: string | null
  transferToAccountName: string | null
  transferToCardId: string | null
  transferToCardName: string | null
  /** Amount that entered the destination account, in its currency. */
  transferToAmount?: string | null
  transferToCurrency?: string | null
  /** The rate came from the market quote instead of a user value. */
  transferEstimated?: boolean
  possibleDuplicateOfId?: string | null
  /** Movimiento con el que este forma un par (por ejemplo, una reversa). */
  linkedTransactionId?: string | null
  aiMetadata?: Record<string, unknown> | null
  /** Cuota, cobro o meta a la que el movimiento quedó vinculado. */
  planningLink?: FinanceTransactionPlanningLink | null
  /** Present when the API groups a transfer operation (web default). */
  kind?: "TRANSACTION" | "OPERATION"
  operationType?: "TRANSFER"
  legs?: FinanceOperationLeg[]
}

export type FinanceOperationLeg = FinanceTransaction & {
  legRole: string | null
}

export type FinanceTransferResult = {
  transferGroupId: string
  debit: FinanceTransaction
  credit: FinanceTransaction
  suggestGoalId?: string
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
