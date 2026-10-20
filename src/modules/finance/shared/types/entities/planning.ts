import type { FinanceCategoryType } from "./transactions.ts"

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

/** Badge variants of the same statuses, shared by the detail and share views. */
export const FINANCE_RECEIVABLE_STATUS_VARIANT: Record<
  FinanceReceivableStatus,
  "success" | "info" | "warning" | "secondary"
> = {
  PENDING: "warning",
  PARTIAL: "info",
  PAID: "success",
  CANCELLED: "secondary",
  WRITTEN_OFF: "secondary",
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
