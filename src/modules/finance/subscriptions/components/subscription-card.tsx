"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import {
  billingCycleLabel,
  subscriptionCardState,
  subscriptionStatusLabel,
  subscriptionStatusVariant,
} from "@/src/modules/finance/subscriptions/lib/subscription-display"
import { subscriptionCycleProgress } from "@/src/modules/finance/subscriptions/lib/subscription-timing"
import { SubscriptionProgressRing } from "@/src/modules/finance/subscriptions/components/subscription-progress-ring"
import type { FinanceSubscription } from "@/src/modules/finance/shared/types/entities"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { Badge } from "@/src/shared/components/ui/badge"
import { LinkPendingOverlay } from "@/src/shared/components/ui/navigation-pending"
import { cn } from "@/src/shared/lib/utils"
import { TriangleAlertIcon } from "lucide-react"
import Link from "next/link"

type SubscriptionCardProps = {
  subscription: FinanceSubscription
  display: FinanceMoneyDisplay
  today: Date
  /** Warning window in days, from the global setting. */
  windowDays: number
}

/**
 * Card of one subscription: brand logo with its cycle ring, the charge date as
 * a pill, and the warning mark when the last charge did not match.
 */
export function SubscriptionCard({
  subscription,
  display,
  today,
  windowDays,
}: SubscriptionCardProps) {
  const state = subscriptionCardState({ subscription, today, windowDays })
  const progress = subscriptionCycleProgress(subscription, today)
  const money = { ...display, currency: subscription.currency }
  const categoryLabel =
    subscription.category?.name ??
    billingCycleLabel(subscription.billingCycle, subscription.billingInterval)

  return (
    <Link
      href={APP_ROUTES.app.financeSubscription(subscription.id)}
      className={cn(
        "relative flex flex-col gap-3 rounded-2xl bg-card p-4 transition-colors hover:bg-muted/40",
        state.inWindow ? "border-2 border-warning" : "border border-border"
      )}
    >
      <div className="flex items-start gap-3">
        <SubscriptionProgressRing
          percent={progress.percent}
          size={40}
          tone={state.inWindow ? "warning" : "primary"}
        >
          <BrandLogo
            name={subscription.name}
            logoUrl={subscription.logoUrl}
            size={38}
          />
        </SubscriptionProgressRing>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{subscription.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {categoryLabel}
          </p>
        </div>
        <Badge variant={state.inWindow ? "warning" : "secondary"}>
          {state.label}
        </Badge>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
          Monto
        </p>
        <p className="flex items-baseline gap-1 text-xl font-bold tabular-nums">
          {state.onTrial ? (
            <span>Gratis</span>
          ) : (
            <>
              {formatFinanceMoney(subscription.amount, money)}
              {subscription.billingCycle === "MONTHLY" &&
              subscription.billingInterval === 1 ? (
                <span className="text-xs font-medium text-muted-foreground">
                  /mes
                </span>
              ) : (
                <span className="text-xs font-medium text-muted-foreground">
                  ≈ {formatFinanceMoney(subscription.monthlyEquivalent, money)}
                  /mes
                </span>
              )}
            </>
          )}
        </p>
        {state.warnLastCharge && subscription.lastPaymentAmount ? (
          <Badge variant="warning" className="mt-1">
            <TriangleAlertIcon aria-hidden />
            Último {formatFinanceMoney(subscription.lastPaymentAmount, money)}
          </Badge>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-xs text-muted-foreground">
          {paymentMethodLabel(subscription) ?? "Sin método de pago"}
        </span>
        {state.overdue ? (
          <Badge variant="danger">Vencida</Badge>
        ) : subscription.status !== "ACTIVE" ? (
          <Badge variant={subscriptionStatusVariant(subscription.status)}>
            {subscriptionStatusLabel(subscription.status)}
          </Badge>
        ) : null}
      </div>
      <LinkPendingOverlay />
    </Link>
  )
}

function paymentMethodLabel(subscription: FinanceSubscription): string | null {
  const method = subscription.paymentMethod
  if (!method) {
    return null
  }
  const last4 = method.last4 ? ` ••${method.last4}` : ""
  return `${method.name}${last4}`
}
