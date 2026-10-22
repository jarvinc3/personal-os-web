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
