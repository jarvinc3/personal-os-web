export type FinanceBillingCycle =
  "WEEKLY" | "MONTHLY" | "QUARTERLY" | "SEMIANNUAL" | "YEARLY"

export type FinanceSubscriptionStatus = "ACTIVE" | "PAUSED" | "CANCELLED"

export type FinanceSubscriptionListQuery = {
  status?: FinanceSubscriptionStatus
  currency?: string
  categoryId?: string
  /** Comma-separated ids; the list endpoint reads them as a list. */
  categoryIds?: string
  frequency?: "MONTHLY" | "YEARLY" | "OTHER"
  sort?: "NEXT_DATE" | "AMOUNT" | "NAME"
  cardId?: string
  accountId?: string
  unassignedCategory?: boolean
  unassignedMethod?: boolean
  q?: string
}

export const FINANCE_SUBSCRIPTION_GROUP_BYS = [
  "category",
  "provider",
  "none",
] as const
export type FinanceSubscriptionGroupBy =
  (typeof FINANCE_SUBSCRIPTION_GROUP_BYS)[number]

export type FinanceSubscriptionPaymentSource = "AUTO" | "MANUAL"

export type FinanceSubscriptionPaymentMethod = {
  type: "CARD" | "ACCOUNT"
  id: string
  name: string
  institution: string | null
  last4: string | null
  logoUrl: string | null
}

export type FinanceSubscriptionCategory = {
  id: string
  name: string
  icon: string | null
  color: string | null
}

export type FinanceSubscription = {
  id: string
  name: string
  normalizedKey: string
  domain: string | null
  logoUrl: string | null
  amount: string
  currency: string
  billingCycle: FinanceBillingCycle
  billingInterval: number
  anchorDate: string
  nextBillingDate: string
  trialEndsAt: string | null
  status: FinanceSubscriptionStatus
  pausedAt: string | null
  cancelledAt: string | null
  reminderDaysBefore: number
  lastRemindedFor: string | null
  /** Last charge did not match the expected amount. */
  lastChargeMismatch: boolean
  /** Amount of the newest charge, for the warning mark. */
  lastPaymentAmount: string | null
  cardId: string | null
  cardName: string | null
  accountId: string | null
  accountName: string | null
  categoryId: string | null
  category: FinanceSubscriptionCategory | null
  paymentMethod: FinanceSubscriptionPaymentMethod | null
  manageUrl: string | null
  notes: string | null
  sourcePatternId: string | null
  monthlyEquivalent: string
  annualEquivalent: string
  daysUntil: number
  createdAt: string
  updatedAt: string
}

export type FinanceSubscriptionPayment = {
  id: string
  amount: string
  currency: string
  paidAt: string
  source: FinanceSubscriptionPaymentSource
  transactionId: string | null
  transaction: {
    id: string
    merchant: string | null
    amount: string
    currency: string
    transactionDate: string
    accountName: string | null
    cardName: string | null
  } | null
}

export type FinanceSubscriptionTrend = {
  direction: "up" | "down" | "flat"
  percent: number
}

export type FinanceSubscriptionCurrencyCost = {
  currency: string
  monthlyCost: string
  annualCost: string
  activeCount: number
}

export type FinanceSubscriptionSummary = {
  baseCurrency: string
  activeCount: number
  monthlyCost: string
  annualCost: string
  /** Native monthly and annual cost per currency; no conversion. */
  byCurrency: FinanceSubscriptionCurrencyCost[]
  previousMonthlyCost: string
  realSpendThisMonth: string
  realSpendPreviousMonth: string
  trend: FinanceSubscriptionTrend | null
  pendingDetectedCount: number
  cancelledAnnualSavings: string
  /** Days before a charge the app warns about it; the global setting. */
  reminderWindowDays: number
  upcoming: FinanceSubscription[]
}

export const FINANCE_SUBSCRIPTION_BREAKDOWNS = [
  "category",
  "instrument",
  "currency",
] as const
export type FinanceSubscriptionBreakdownAxis =
  (typeof FINANCE_SUBSCRIPTION_BREAKDOWNS)[number]

export type FinanceSubscriptionBreakdownItem = {
  key: string
  label: string
  color: string | null
  count: number
  amount: string
}

export type FinanceSubscriptionBreakdown = {
  baseCurrency: string
  by: FinanceSubscriptionBreakdownAxis
  items: FinanceSubscriptionBreakdownItem[]
}

export type FinanceSubscriptionUpcomingCharge = {
  id: string
  subscriptionId: string
  name: string
  logoUrl: string | null
  amount: string
  currency: string
  date: string
  daysUntil: number
  paymentMethod: FinanceSubscriptionPaymentMethod | null
}

export type FinanceSubscriptionUpcoming = {
  from: string
  to: string
  items: FinanceSubscriptionUpcomingCharge[]
}

export const FINANCE_SUBSCRIPTION_ALERT_KINDS = [
  "PRICE_INCREASE",
  "AMOUNT_MISMATCH",
  "TRIAL_ENDING",
  "ANNUAL_RENEWAL",
  "MISSED_CHARGE",
] as const
export type FinanceSubscriptionAlertKind =
  (typeof FINANCE_SUBSCRIPTION_ALERT_KINDS)[number]

export type FinanceSubscriptionAlert = {
  id: string
  kind: FinanceSubscriptionAlertKind
  subscriptionId: string
  subscriptionName: string
  date: string
  currency: string
  amount: string | null
  previousAmount: string | null
  /** Expected charge of the subscription; set on `AMOUNT_MISMATCH`. */
  expectedAmount: string | null
  percent: number | null
  daysUntil: number | null
}
