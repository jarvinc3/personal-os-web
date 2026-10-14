import type {
  FinanceAccountType,
  FinanceCardNetwork,
  FinanceCardType,
  FinanceInstitutionType,
} from "@/src/modules/finance/shared/constants/catalog"

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

export type FinanceAnalyticsSummary = {
  baseCurrency: string
  netWorth: string | null
  cashFlow: string
  balanceStatus: FinanceBalanceSheetStatus
  balanceIssues: FinanceBalanceSheetIssue[]
  totals: {
    accountBalance: string
    cardDebt: string | null
    income: string
    expenses: string
  }
}

export type FinanceBalanceSheetStatus = "COMPLETE" | "INCOMPLETE"

export type FinanceBalanceSheetIssue = {
  code: "MISSING_CREDIT_LIMIT"
  cardId: string
  currency: string
}

export type FinanceBalanceSheetSlice = {
  status: FinanceBalanceSheetStatus
  assets: { accounts: string }
  liabilities: {
    creditCards: string | null
    loans: string
  }
  totalAssets: string
  totalLiabilities: string | null
  netWorth: string | null
  issues: FinanceBalanceSheetIssue[]
}

export type FinanceBalanceSheet = {
  asOf: string
  rateDate: string
  baseCurrency: string
  global: FinanceBalanceSheetSlice
  institutions: Array<FinanceBalanceSheetSlice & { institutionId: string }>
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
  institutionId: string | null
  institutionName: string | null
  institutionLogoUrl?: string | null
  name: string
  type: FinanceAccountType
  currency: string
  accountNumber: string | null
  isDefaultForInstitution?: boolean
  balance: string
  earmarkedAmount: string
  freeBalance: string
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
  institutionLogoUrl?: string | null
  networkLogoUrl?: string | null
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

export const FINANCE_CARD_STATEMENT_STATUSES = [
  "OPEN",
  "CLOSED",
  "PARTIAL",
  "MINIMUM_PAID",
  "PAID",
  "OVERDUE",
] as const
export type FinanceCardStatementStatus =
  (typeof FINANCE_CARD_STATEMENT_STATUSES)[number]

export const FINANCE_CARD_STATEMENT_STATUS_LABEL: Record<
  FinanceCardStatementStatus,
  string
> = {
  OPEN: "En curso",
  CLOSED: "Cerrado",
  PARTIAL: "Parcial",
  MINIMUM_PAID: "Mínimo pagado",
  PAID: "Pagada",
  OVERDUE: "Vencida",
}

export type FinanceCardStatement = {
  id: string
  currency: string
  cycleStart: string
  cycleEnd: string
  dueDate: string | null
  closingBalance: string
  minimumPayment: string
  minimumSource: "IMPORTED" | "ESTIMATED" | "MANUAL"
  paidAmount: string
  remaining: string
  status: FinanceCardStatementStatus
}

export type FinanceCardStatementMovement = {
  id: string
  type: string
  status: string
  amount: string
  currency: string
  ledgerAmount: string
  ledgerCurrency: string
  transactionDate: string
  merchant: string | null
  description: string | null
  transferGroupId: string | null
}

export type FinanceCardStatementDetail = {
  statement: FinanceCardStatement
  movements: FinanceCardStatementMovement[]
  payments: FinanceCardStatementMovement[]
}

export type FinanceStatementImportStatus =
  "PARSING" | "READY" | "APPLIED" | "FAILED" | "DISCARDED"

export type FinanceStatementLineDecision = "MATCH" | "CREATE" | "IGNORE"

export type FinanceStatementLineType = "DEBIT" | "CREDIT"

export type FinanceStatementImportLine = {
  id: string
  date: string
  description: string
  amount: string
  currency: string
  type: FinanceStatementLineType
  reference: string | null
  decision: FinanceStatementLineDecision
  categoryId: string | null
  categoryName: string | null
  transactionId: string | null
}

export type FinanceStatementImportExtra = {
  id: string
  date: string
  description: string | null
  merchant: string | null
  amount: string
  currency: string
  type: string
}

export type FinanceStatementImportTarget = {
  kind: "CARD" | "ACCOUNT"
  id: string
  name: string
  currency: string
}

export type FinanceStatementImport = {
  id: string
  status: FinanceStatementImportStatus
  error: string | null
  failureReason: string | null
  target: FinanceStatementImportTarget
  header: {
    currency: string
    periodStart: string | null
    periodEnd: string | null
    dueDate: string | null
    previousBalance: string | null
    closingBalance: string | null
    minimumPayment: string | null
  }
  period: { from: string; to: string } | null
  counts: { lines: number; matched: number; missing: number; extra: number }
  lines: FinanceStatementImportLine[]
  extra: FinanceStatementImportExtra[]
  difference: string | null
  adjustment: { amount: string; currency: string } | null
  createdAt: string
  appliedAt: string | null
}

export type FinanceInstitution = {
  id: string
  name: string
  type?: FinanceInstitutionType
  shortName?: string | null
  sortOrder?: number
  domain?: string | null
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
  type: FinanceCategoryType
  createdAt: string
}

export const FINANCE_BUDGET_PERIODS = ["MONTHLY", "BIWEEKLY", "CUSTOM"] as const
export type FinanceBudgetPeriod = (typeof FINANCE_BUDGET_PERIODS)[number]

export const FINANCE_BUDGET_PERIOD_LABEL: Record<FinanceBudgetPeriod, string> =
  {
    MONTHLY: "Mensual",
    BIWEEKLY: "Quincenal",
    CUSTOM: "Personalizado",
  }

export type FinanceBudgetCategory = {
  id: string
  name: string
  icon: string | null
  color: string | null
}

export const FINANCE_BUDGET_ROLLOVERS = [
  "NONE",
  "SURPLUS",
  "SURPLUS_AND_DEFICIT",
] as const
export type FinanceBudgetRollover = (typeof FINANCE_BUDGET_ROLLOVERS)[number]

export const FINANCE_BUDGET_ROLLOVER_LABEL: Record<
  FinanceBudgetRollover,
  string
> = {
  NONE: "Sin arrastre",
  SURPLUS: "Arrastra el sobrante",
  SURPLUS_AND_DEFICIT: "Arrastra sobrante y déficit",
}

export type FinanceBudget = {
  id: string
  name?: string | null
  categoryId: string
  category?: FinanceBudgetCategory | null
  /** Full category set; falls back to `category` on older payloads. */
  categories?: FinanceBudgetCategory[]
  includeChildren?: boolean
  rollover?: FinanceBudgetRollover
  carriedOver?: string
  effectiveLimit?: string
  recurring?: boolean
  periodType: FinanceBudgetPeriod
  periodStart: string
  periodEnd: string
  amountLimit: string
  amountSpent: string
  alertThresholdPct: number
}

export type FinanceBudgetStatus = {
  id: string
  categoryId: string
  category: string
  color: string | null
  icon: string | null
  periodType: string
  periodStart: string
  periodEnd: string
  amountLimit: string
  amountSpent: string
  pctUsed: number
  threshold: number
}

export type FinanceSavingsGoal = {
  id: string
  name: string
  description: string | null
  targetAmount: string
  currentAmount: string
  currency: string
  targetDate: string | null
  accountId: string | null
  mode: "EARMARK" | "DEDICATED"
  spendReducesProgress: boolean
  isCompleted: boolean
  completedAt: string | null
}

/** One amount set aside for a goal. The goal balance is the sum of them. */
export type FinanceSavingsGoalContribution = {
  id: string
  goalId: string
  amount: string
  contributedAt: string
  kind: "CONTRIBUTION" | "WITHDRAWAL"
  accountId: string | null
  transactionId: string | null
  notes: string | null
  createdAt: string
}

export const FINANCE_INSTALLMENT_FREQS = [
  "WEEKLY",
  "BIWEEKLY",
  "MONTHLY",
] as const
export type FinanceInstallmentFreq = (typeof FINANCE_INSTALLMENT_FREQS)[number]

export const FINANCE_INSTALLMENT_FREQ_LABEL: Record<
  FinanceInstallmentFreq,
  string
> = {
  WEEKLY: "Semanal",
  BIWEEKLY: "Quincenal",
  MONTHLY: "Mensual",
}

export type FinanceLoan = {
  id: string
  institutionId: string | null
  institution?: { id: string; name: string } | null
  accountId: string | null
  account?: { id: string; name: string } | null
  lenderName: string
  originalAmount: string
  currentBalance: string
  currency: string
  installmentAmount: string
  installmentFreq: FinanceInstallmentFreq
  totalInstallments: number
  paidInstallments: number
  nextDueDate: string
  /** Fraction 0–1 as a decimal string, e.g. `"0.12"` = 12%. Null means not provided. */
  interestRate: string | null
  rateType: "FIXED" | "VARIABLE"
  insuranceAmount: string | null
  prepaymentPenaltyPct: string | null
  notes: string | null
  isActive: boolean
}

export type FinanceLoanInstallmentStatus =
  "PENDING" | "PARTIAL" | "PAID" | "OVERDUE"

export const FINANCE_LOAN_INSTALLMENT_STATUS_LABEL: Record<
  FinanceLoanInstallmentStatus,
  string
> = {
  PENDING: "Pendiente",
  PARTIAL: "Parcial",
  PAID: "Pagada",
  OVERDUE: "Vencida",
}

export type FinanceLoanInstallment = {
  id: string
  loanId: string
  installmentNo: number
  dueDate: string
  amount: string
  principal: string
  interest: string
  insurance: string
  fees: string
  lateFee: string
  paidAmount: string
  status: FinanceLoanInstallmentStatus
  paidAt: string | null
  transactionId?: string | null
}

export const FINANCE_RECEIVABLE_STATUSES = [
  "PENDING",
  "PARTIAL",
  "PAID",
  "CANCELLED",
  "WRITTEN_OFF",
] as const
export type FinanceReceivableStatus =
  (typeof FINANCE_RECEIVABLE_STATUSES)[number]

export const FINANCE_RECEIVABLE_STATUS_LABEL: Record<
  FinanceReceivableStatus,
  string
> = {
  PENDING: "Pendiente",
  PARTIAL: "Parcial",
  PAID: "Pagado",
  CANCELLED: "Cancelado",
  WRITTEN_OFF: "Castigado",
}

export type FinanceReceivable = {
  id: string
  debtorName: string
  description: string | null
  amount: string
  paidAmount: string
  creditBalance: string
  writtenOffAmount: string
  writtenOffAt: string | null
  currency: string
  dueDate: string | null
  status: FinanceReceivableStatus
}

/** One amount collected for a receivable, with the income it created. */
export type FinanceReceivablePayment = {
  id: string
  receivableId: string
  amount: string
  paidAt: string
  accountId: string | null
  account?: { id: string; name: string } | null
  transactionId: string | null
  notes: string | null
  createdAt: string
}

export type FinanceEmailSyncLog = {
  id: string
  status: string
  error: string | null
  emailsScanned: number
  transactionsNew: number
  startedAt: string
  completedAt: string | null
}

export type FinanceEmailSource = {
  id: string
  connectionId: string
  institutionId: string
  institutionName: string | null
  emailAddress: string
  bankSenderEmail: string | null
  bankSenderEmails?: string[]
  bankDomain: string
  label: string | null
  provider: string
  isActive: boolean
  lastSyncedAt: string | null
  createdAt: string
  logs: FinanceEmailSyncLog[]
}

export type FinanceMailbox = {
  id: string
  emailAddress: string
  provider: string
  isActive: boolean
  createdAt: string
  sources: FinanceEmailSource[]
}

export type FinancePendingEmailMessage = {
  id: string
  sourceId: string
  gmailMessageId: string
  institutionId: string
  institutionName: string
  emailAddress: string
  instrumentHint: string | null
  lastFourHint: string | null
  accountNumberHint: string | null
  extractedPayload: {
    amount?: number | null
    currency?: string
    merchant?: string | null
    description?: string
    notes?: string | null
    type?: string
    movementClass?: string
  } | null
  outcome?: string
  reason: string | null
  createdAt: string
}

export type FinanceEmailProcessedMessage = FinancePendingEmailMessage & {
  outcome: string
}

export type FinanceEmailAssignResult = {
  assigned: boolean
  transactionId?: string
}

export type FinanceEmailSyncTrigger = {
  queued: boolean
  reason?: string
}

export type FinanceMerchant = {
  id: string
  name: string
  normalizedKey: string
  aliases: string[]
  categoryId: string | null
  logoUrl: string | null
  createdAt: string
  /** Spending of the requested window (current month by default). */
  monthSpend: string
  monthMovements: number
}

export type FinanceMerchantSuggestion = {
  merchantId: string
  name: string
  categoryId: string | null
} | null

export type FinanceRecurringFrequency = 7 | 14 | 30 | 365

export type FinanceRecurringStatus = "SUGGESTED" | "CONFIRMED" | "DISMISSED"

export type FinanceRecurringKind =
  | "SUBSCRIPTION"
  | "BILL"
  | "INCOME"
  | "OTHER"

export type FinanceRecurringPattern = {
  id: string
  merchantId: string | null
  merchant: string
  merchantName: string
  logoUrl: string | null
  categoryId: string | null
  avgAmount: string
  currency: string
  frequency: FinanceRecurringFrequency
  nextExpectedDate: string
  lastSeenAt: string | null
  status: FinanceRecurringStatus
  kind: FinanceRecurringKind
  confidenceScore: number
  amountTolerancePct: number
  monthlyEquivalent: string
  annualEquivalent: string
  daysUntil: number
}
