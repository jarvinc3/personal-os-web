import type {
  FinanceBillingCycle,
  FinanceSubscriptionCategory,
  FinanceSubscriptionPaymentMethod,
  FinanceSubscriptionStatus,
  FinanceSubscriptionUpcomingCharge,
} from "@/src/modules/finance/shared/types/entities"

/**
 * What the subscription card paints. `FinanceSubscription` satisfies it, so the
 * list and the detail pass the whole entity; a charge of the upcoming endpoint
 * only carries part of it (#279).
 */
export type SubscriptionCardSource = {
  id: string
  name: string
  logoUrl: string | null
  amount: string
  currency: string
  /** Unknown on a charge: the card leaves the monthly suffix out. */
  billingCycle: FinanceBillingCycle | null
  billingInterval: number
  nextBillingDate: string
  trialEndsAt: string | null
  status: FinanceSubscriptionStatus
  lastChargeMismatch: boolean
  lastPaymentAmount: string | null
  monthlyEquivalent: string | null
  category: FinanceSubscriptionCategory | null
  paymentMethod: FinanceSubscriptionPaymentMethod | null
}

/** One charge of the upcoming endpoint as the card source (#279). */
export function upcomingChargeToCardSource(
  charge: FinanceSubscriptionUpcomingCharge
): SubscriptionCardSource {
  return {
    id: charge.subscriptionId,
    name: charge.name,
    logoUrl: charge.logoUrl,
    amount: charge.amount,
    currency: charge.currency,
    billingCycle: null,
    billingInterval: 1,
    nextBillingDate: charge.date,
    trialEndsAt: null,
    status: "ACTIVE",
    lastChargeMismatch: false,
    lastPaymentAmount: null,
    monthlyEquivalent: null,
    category: null,
    paymentMethod: charge.paymentMethod,
  }
}
