"use client"

import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type { FinanceSubscription } from "@/src/modules/finance/shared/types/entities"
import { SubscriptionCard } from "@/src/modules/finance/subscriptions/components/subscription-card"
import {
  billingMonthLabel,
  shortBillingDate,
  subscriptionCycleProgress,
} from "@/src/modules/finance/subscriptions/lib/subscription-timing"

type SubscriptionDetailHeaderProps = {
  subscription: FinanceSubscription
  display: FinanceMoneyDisplay
  today: Date
  /** Warning window in days, from the global setting. */
  windowDays: number
}

export function SubscriptionDetailHeader({
  subscription,
  display,
  today,
  windowDays,
}: SubscriptionDetailHeaderProps) {
  const cycle = subscriptionCycleProgress(subscription, today)

  return (
    <>
      <SubscriptionCard
        subscription={subscription}
        display={display}
        today={today}
        windowDays={windowDays}
        href={null}
      />
      {cycle ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
          <span>
            Ciclo {shortBillingDate(cycle.startDate, display.locale)} –{" "}
            {shortBillingDate(cycle.endDate, display.locale)}
          </span>
          <span>
            Desde {billingMonthLabel(subscription.createdAt, display.locale)}
          </span>
        </div>
      ) : null}
    </>
  )
}
