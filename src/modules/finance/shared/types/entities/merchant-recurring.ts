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
export type FinanceRecurringKind = "SUBSCRIPTION" | "BILL" | "INCOME" | "OTHER"

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
