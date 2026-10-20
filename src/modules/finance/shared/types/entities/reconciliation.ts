export const FINANCE_RECONCILIATION_KINDS = [
  "IMPUESTO_DGII",
  "COMISION",
  "CARGO_PLASTICO",
  "INTERES",
  "OTRO",
] as const
export type FinanceReconciliationKind =
  (typeof FINANCE_RECONCILIATION_KINDS)[number]

export const FINANCE_RECONCILIATION_KIND_LABEL: Record<
  FinanceReconciliationKind,
  string
> = {
  IMPUESTO_DGII: "Impuesto DGII",
  COMISION: "Comisión",
  CARGO_PLASTICO: "Cargo por plástico",
  INTERES: "Interés",
  OTRO: "Otro",
}

export type FinanceReconciliationAdjustment = {
  id: string
  kind: FinanceReconciliationKind
  amount: string
  transactionId: string
}

export type FinanceReconciliation = {
  id: string
  accountId: string | null
  cardId: string | null
  currency: string
  asOfDate: string
  appBalance: string
  realBalance: string
  difference: string
  note: string | null
  createdAt: string
  adjustments: FinanceReconciliationAdjustment[]
}

export type FinanceReconciliationSuggestedAdjustment = {
  kind: FinanceReconciliationKind
  amount: string
}

/** One editable line of the close sheet, before it becomes a payload. */
export type FinanceReconciliationLineDraft = {
  kind: FinanceReconciliationKind
  amount: string
}

export type FinanceReconciliationPreview = {
  accountId: string | null
  cardId: string | null
  currency: string
  name: string
  appBalance: string
  realBalance: string
  difference: string
  suggestedAdjustments: FinanceReconciliationSuggestedAdjustment[]
}

export type FinanceReconciliationStatusItem = {
  key: string
  kind: "account" | "card"
  accountId: string | null
  cardId: string | null
  currency: string
  name: string
  institutionName: string | null
  balance: string
  reconciled: boolean
  lastReconciledAt: string | null
}

export type FinanceReconciliationStatus = {
  month: string
  items: FinanceReconciliationStatusItem[]
  reconciledCount: number
  pendingCount: number
}

export type FinanceBankCharges = {
  from: string
  to: string
  total: string
  count: number
  byMonth: Array<{ month: string; total: string; count: number }>
  byInstitution: Array<{ name: string; total: string; count: number }>
  byKind: Array<{
    kind: FinanceReconciliationKind
    total: string
    count: number
  }>
}

/** Open deviation between a product's stored balance and its movements (I1). */
export type FinanceBalanceDrift = {
  id: string
  accountId: string | null
  cardId: string | null
  currency: string
  name: string | null
  storedBalance: string
  expectedBalance: string
  difference: string
  detectedAt: string
  resolvedAt: string | null
}

export type FinanceIntegrityCheck = {
  drifts: FinanceBalanceDrift[]
}

export type FinanceBalanceRecalculation = {
  corrected: boolean
  accountId: string | null
  cardId: string | null
  currency: string
  balance: string
}
