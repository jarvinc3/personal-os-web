export const FINANCE_ACCOUNT_TYPES = [
  "CHECKING",
  "SAVINGS",
  "CASH",
  "INVESTMENT",
] as const
export type FinanceAccountType = (typeof FINANCE_ACCOUNT_TYPES)[number]

export const FINANCE_ACCOUNT_TYPE_LABEL: Record<FinanceAccountType, string> = {
  CHECKING: "Corriente",
  SAVINGS: "Ahorros",
  CASH: "Efectivo",
  INVESTMENT: "Inversión",
}

export const FINANCE_CARD_TYPES = ["CREDIT", "DEBIT"] as const
export type FinanceCardType = (typeof FINANCE_CARD_TYPES)[number]

export const FINANCE_CARD_TYPE_LABEL: Record<FinanceCardType, string> = {
  CREDIT: "Crédito",
  DEBIT: "Débito",
}

export const FINANCE_CARD_NETWORKS = [
  "VISA",
  "MASTERCARD",
  "AMEX",
  "DISCOVER",
  "OTHER",
] as const
export type FinanceCardNetwork = (typeof FINANCE_CARD_NETWORKS)[number]

export const FINANCE_CARD_NETWORK_LABEL: Record<FinanceCardNetwork, string> = {
  VISA: "Visa",
  MASTERCARD: "Mastercard",
  AMEX: "Amex",
  DISCOVER: "Discover",
  OTHER: "Otra",
}

export const CATALOG_NONE = "__none__" as const
