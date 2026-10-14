import type {
  FinanceBillingCycle,
  FinanceSubscriptionStatus,
} from "@/src/modules/finance/shared/types/entities"

export const BILLING_CYCLE_LABEL: Record<FinanceBillingCycle, string> = {
  WEEKLY: "Semanal",
  MONTHLY: "Mensual",
  QUARTERLY: "Trimestral",
  SEMIANNUAL: "Semestral",
  YEARLY: "Anual",
}

export const SUBSCRIPTION_STATUS_LABEL: Record<
  FinanceSubscriptionStatus,
  string
> = {
  ACTIVE: "Activa",
  PAUSED: "Pausada",
  CANCELLED: "Cancelada",
}

export type SubscriptionBadgeVariant = "success" | "warning" | "secondary"

export function billingCycleLabel(
  cycle: FinanceBillingCycle,
  interval: number
): string {
  const base = BILLING_CYCLE_LABEL[cycle] ?? cycle
  return interval > 1 ? `${base} cada ${interval}` : base
}

export function subscriptionStatusVariant(
  status: FinanceSubscriptionStatus
): SubscriptionBadgeVariant {
  if (status === "ACTIVE") {
    return "success"
  }
  if (status === "PAUSED") {
    return "warning"
  }
  return "secondary"
}

export function subscriptionStatusLabel(
  status: FinanceSubscriptionStatus
): string {
  return SUBSCRIPTION_STATUS_LABEL[status] ?? status
}
