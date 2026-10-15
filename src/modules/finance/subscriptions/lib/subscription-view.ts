import type {
  FinanceRecurringPattern,
  FinanceSubscription,
  FinanceSubscriptionBreakdownAxis,
  FinanceSubscriptionBreakdownItem,
  FinanceSubscriptionGroupBy,
  FinanceSubscriptionUpcomingCharge,
} from "@/src/modules/finance/shared/types/entities"
import {
  formatFinanceMoney,
  parseFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import { brandInitials } from "@/src/modules/finance/shared/components/brand-initials"
import type { RingStackSlice } from "@/src/modules/finance/shared/lib/ring-stack"

export const SUBSCRIPTION_BREAKDOWN_LABEL: Record<
  FinanceSubscriptionBreakdownAxis,
  string
> = {
  category: "Categoría",
  instrument: "Tarjeta o cuenta",
  currency: "Moneda",
}

const UNCATEGORIZED_GROUP_LABEL = "Sin categoría"
const NO_METHOD_GROUP_LABEL = "Sin método"
const UNCATEGORIZED_GROUP_KEY = "uncategorized"
const NO_METHOD_GROUP_KEY = "no-method"

export type SubscriptionGroup = {
  key: string
  label: string
  items: FinanceSubscription[]
}

function groupKeyFor(
  subscription: FinanceSubscription,
  groupBy: FinanceSubscriptionGroupBy
): { key: string; label: string } {
  if (groupBy === "category") {
    if (!subscription.category) {
      return { key: UNCATEGORIZED_GROUP_KEY, label: UNCATEGORIZED_GROUP_LABEL }
    }
    return { key: subscription.category.id, label: subscription.category.name }
  }
  if (groupBy === "provider") {
    if (!subscription.paymentMethod) {
      return { key: NO_METHOD_GROUP_KEY, label: NO_METHOD_GROUP_LABEL }
    }
    return {
      key: subscription.paymentMethod.id,
      label: subscription.paymentMethod.name,
    }
  }
  return { key: "all", label: "Todas" }
}

/** Groups the card list per the user's `subscriptions.groupBy` setting. */
export function groupSubscriptions(
  items: FinanceSubscription[],
  groupBy: FinanceSubscriptionGroupBy
): SubscriptionGroup[] {
  const groups = new Map<string, SubscriptionGroup>()
  for (const item of items) {
    const descriptor = groupKeyFor(item, groupBy)
    const existing = groups.get(descriptor.key)
    if (existing) {
      existing.items.push(item)
      continue
    }
    groups.set(descriptor.key, {
      key: descriptor.key,
      label: descriptor.label,
      items: [item],
    })
  }
  return [...groups.values()]
}

/** Charges of each day, keyed by `YYYY-MM-DD`, for the monthly calendar. */
export function upcomingByDay(
  items: FinanceSubscriptionUpcomingCharge[]
): Map<string, FinanceSubscriptionUpcomingCharge[]> {
  const byDay = new Map<string, FinanceSubscriptionUpcomingCharge[]>()
  for (const item of items) {
    const day = byDay.get(item.date)
    if (day) {
      day.push(item)
      continue
    }
    byDay.set(item.date, [item])
  }
  return byDay
}

const SUBSCRIPTION_SLICE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

/** Maps the breakdown groups to the shared ring/legend slice shape. */
export function buildSubscriptionSlices(
  items: FinanceSubscriptionBreakdownItem[],
  display: FinanceMoneyDisplay
): RingStackSlice[] {
  const total = items.reduce(
    (sum, item) => sum + (parseFinanceMoney(item.amount) ?? 0),
    0
  )
  return items.map((item, index) => {
    const amount = parseFinanceMoney(item.amount) ?? 0
    const percent = total > 0 ? (amount / total) * 100 : 0
    return {
      key: item.key,
      kind: "institution",
      name: item.label,
      monogram: brandInitials(item.label),
      logoUrl: null,
      color:
        item.color ??
        SUBSCRIPTION_SLICE_COLORS[index % SUBSCRIPTION_SLICE_COLORS.length]!,
      signedValue: amount,
      amountLabel: formatFinanceMoney(amount, display),
      assetsValue: amount,
      debtValue: 0,
      debtLabel: null,
      value: amount,
      percent,
      percentLabel:
        percent > 0 && Math.round(percent) === 0
          ? "<1%"
          : `${Math.round(percent)}%`,
    }
  })
}

/** Create payload that turns a detected recurring charge into a subscription. */
export function subscriptionPayloadFromPattern(
  pattern: FinanceRecurringPattern
): Record<string, unknown> {
  const schedule =
    pattern.frequency === 365
      ? { billingCycle: "YEARLY", billingInterval: 1 }
      : pattern.frequency === 7
        ? { billingCycle: "WEEKLY", billingInterval: 1 }
        : pattern.frequency === 14
          ? { billingCycle: "WEEKLY", billingInterval: 2 }
          : { billingCycle: "MONTHLY", billingInterval: 1 }
  return {
    name: pattern.merchantName,
    amount: Number(pattern.avgAmount),
    currency: pattern.currency,
    anchorDate: pattern.nextExpectedDate,
    sourcePatternId: pattern.id,
    ...schedule,
  }
}
