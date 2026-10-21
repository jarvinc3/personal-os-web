import type {
  FinanceAccountType,
  FinanceCardNetwork,
  FinanceCardType,
  FinanceInstitutionType,
} from "@/src/modules/finance/shared/constants/catalog"

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

export type FinanceBalanceSheetIssue =
  | { code: "MISSING_CREDIT_LIMIT"; cardId: string; currency: string }
  | { code: "MISSING_RATE"; currency: string }

export type FinanceBalanceSheetSlice = {
  status: FinanceBalanceSheetStatus
  assets: {
    /** All account balances on the base currency, cash included. */
    accounts: string
    /** Informational subset of `accounts`; never add it again. */
    cash: string
    receivables: string
  }
  liabilities: {
    creditCards: string | null
    loans: string
  }
  totalAssets: string
  totalLiabilities: string | null
  netWorth: string | null
  issues: FinanceBalanceSheetIssue[]
}

export type FinanceBalanceSheetLineKind =
  "ACCOUNT" | "CASH" | "RECEIVABLE" | "CREDIT_CARD" | "LOAN"

export type FinanceBalanceSheetReconciliation =
  "RECONCILED" | "PENDING" | "NOT_APPLICABLE"

/** One product in the net-worth breakdown; amounts arrive in its own currency. */
export type FinanceBalanceSheetLine = {
  id: string
  kind: FinanceBalanceSheetLineKind
  name: string
  description: string | null
  institutionId: string | null
  currency: string
  balance: string
  balanceBase: string | null
  hasDrift: boolean
  driftDifference: string | null
  reconciliation: FinanceBalanceSheetReconciliation
  creditLimit: string | null
  availableCredit: string | null
  dueDate: string | null
  doubtful: boolean
}

export type FinanceBalanceSheetCurrencyTotals = {
  assets: string
  available: string
  receivables: string
  liabilities: string
  netWorth: string
  doubtfulReceivables: string
}

export type FinanceBalanceSheetCurrencyTotalsBase = {
  assets: string | null
  available: string | null
  receivables: string | null
  liabilities: string | null
  netWorth: string | null
  doubtfulReceivables: string | null
}

export type FinanceBalanceSheetCurrencyGroup = {
  currency: string
  accounts: FinanceBalanceSheetLine[]
  cash: FinanceBalanceSheetLine[]
  receivables: FinanceBalanceSheetLine[]
  creditCards: FinanceBalanceSheetLine[]
  loans: FinanceBalanceSheetLine[]
  doubtfulReceivables: FinanceBalanceSheetLine[]
  totals: FinanceBalanceSheetCurrencyTotals
  totalsBase: FinanceBalanceSheetCurrencyTotalsBase
}

export type FinanceBalanceSheetBreakdown = {
  byCurrency: FinanceBalanceSheetCurrencyGroup[]
  totals: FinanceBalanceSheetCurrencyTotalsBase
}

export type FinanceCashAccountLine = {
  id: string
  name: string
  balance: string
}

export type FinanceCashCurrencyBreakdown = {
  currency: string
  total: string
  totalBase: string | null
  accounts: FinanceCashAccountLine[]
}

/** Cash converted to the base currency, with a per-currency breakdown. */
export type FinanceCashSummary = {
  totalBase: string | null
  baseCurrency: string
  rateDate: string
  status: FinanceBalanceSheetStatus
  byCurrency: FinanceCashCurrencyBreakdown[]
}

export type FinanceBalanceSheet = {
  asOf: string
  rateDate: string
  baseCurrency: string
  global: FinanceBalanceSheetSlice
  institutions: Array<FinanceBalanceSheetSlice & { institutionId: string }>
  cash: FinanceCashSummary
  breakdown: FinanceBalanceSheetBreakdown
}

export type FinanceAccount = {
  id: string
  institutionId: string | null
  institutionName: string | null
  institutionLogoUrl?: string | null
  name: string
  type: FinanceAccountType
  currency: string
  accountNumberLast4: string | null
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
  /** Límite menos deuda confirmada y pendientes; null sin límite. */
  availableCredit: string | null
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
  /** Próximo corte, YYYY-MM-DD; null sin día de corte. */
  nextStatementDate: string | null
  /** Fecha límite de pago del próximo corte, YYYY-MM-DD. */
  nextPaymentDueDate: string | null
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
  isSystem?: boolean
}
