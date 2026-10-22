"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import type { FinanceSubscription } from "@/src/modules/finance/shared/types/entities"
import {
  billingCycleLabel,
  subscriptionStatusLabel,
  subscriptionStatusVariant,
} from "@/src/modules/finance/subscriptions/lib/subscription-display"
import {
  billingMonthLabel,
  shortBillingDate,
  subscriptionCycleProgress,
} from "@/src/modules/finance/subscriptions/lib/subscription-timing"
import { Badge } from "@/src/shared/components/ui/badge"

type SubscriptionDetailHeaderProps = {
  subscription: FinanceSubscription
  today: Date
}

export function SubscriptionDetailHeader({
  subscription,
  today,
}: SubscriptionDetailHeaderProps) {
  const cycle = subscriptionCycleProgress(subscription, today)

  return (
    <>
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <BrandLogo
          name={subscription.name}
          logoUrl={subscription.logoUrl}
          size={48}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold">
            {subscription.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {billingCycleLabel(
              subscription.billingCycle,
              subscription.billingInterval
            )}
          </p>
        </div>
        <Badge variant={subscriptionStatusVariant(subscription.status)}>
          {subscriptionStatusLabel(subscription.status)}
        </Badge>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
        <span>
          Ciclo {shortBillingDate(cycle.startDate)} –{" "}
          {shortBillingDate(cycle.endDate)}
        </span>
        <span>Desde {billingMonthLabel(subscription.createdAt)}</span>
      </div>
    </>
  )
}
