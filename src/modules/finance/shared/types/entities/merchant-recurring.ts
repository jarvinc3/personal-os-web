export type FinanceMerchantCategorySource = "MANUAL" | "LEARNED" | "KEYWORD"

export type FinanceMerchant = {
  id: string
  name: string
  normalizedKey: string
  aliases: string[]
  categoryId: string | null
  /** Who chose the category: the user or the app (learned or keyword). */
  categorySource?: FinanceMerchantCategorySource | null
  /** Brand domain behind the logo; null when the logo is the uploaded image. */
  domain?: string | null
  logoUrl: string | null
  createdAt: string
  /** Spending of the requested window (current month by default). */
  monthSpend: string
  monthMovements: number
  /** In the list: how many other merchants look like this one. */
  possibleDuplicates?: number
}

export const FINANCE_MERCHANT_DUPLICATE_REASONS = [
  "SAME_KEY",
  "ALIAS_MATCH",
  "TRAILING_NUMBER",
  "NAME_CONTAINED",
  "SIMILAR_NAME",
] as const

export type FinanceMerchantDuplicateReason =
  (typeof FINANCE_MERCHANT_DUPLICATE_REASONS)[number]

/** A merchant the back considers the same one, with the reason why. */
export type FinanceMerchantDuplicate = {
  id: string
  name: string
  logoUrl: string | null
  monthSpend: string
  monthMovements: number
  reason: FinanceMerchantDuplicateReason
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
