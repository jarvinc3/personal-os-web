"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import {
  billingCycleLabel,
  subscriptionStatusLabel,
  subscriptionStatusVariant,
} from "@/src/modules/finance/subscriptions/lib/subscription-display"
import { subscriptionCycleProgress } from "@/src/modules/finance/subscriptions/lib/subscription-view"
import { nextChargeLabel } from "@/src/modules/finance/subscriptions/lib/recurring-display"
import type { FinanceSubscription } from "@/src/modules/finance/shared/types/entities"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { Badge } from "@/src/shared/components/ui/badge"
import { cn } from "@/src/shared/lib/utils"
import { CreditCardIcon, LandmarkIcon, WalletIcon } from "lucide-react"
import Link from "next/link"

const CYCLE_TRACK_CLASS = "h-1.5 w-full overflow-hidden rounded-full bg-muted"

function paymentChipLabel(subscription: FinanceSubscription): string | null {
  const method = subscription.paymentMethod
  if (!method) {
    return null
  }
  const last4 = method.last4 ? ` ••${method.last4}` : ""
  return `${method.name}${last4}`
}

type SubscriptionCardProps = {
  subscription: FinanceSubscription
  display: FinanceMoneyDisplay
  now: Date
}

export function SubscriptionCard({
  subscription,
  display,
  now,
}: SubscriptionCardProps) {
  const method = subscription.paymentMethod
  const MethodIcon =
    method?.type === "CARD"
      ? CreditCardIcon
      : method?.type === "ACCOUNT"
        ? LandmarkIcon
        : WalletIcon
  const progress = subscriptionCycleProgress(subscription, now)
  const paymentChip = paymentChipLabel(subscription)
  const isActive = subscription.status === "ACTIVE"

  return (
    <Link
      href={APP_ROUTES.app.financeSubscription(subscription.id)}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/40"
    >
      <div className="flex items-start gap-3">
        <BrandLogo
          name={subscription.name}
          logoUrl={subscription.logoUrl}
          size={44}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{subscription.name}</p>
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

      <div className="flex items-end justify-between gap-3">
        <p className="text-xl font-bold tabular-nums">
          {formatFinanceMoney(subscription.amount, {
            ...display,
            currency: subscription.currency,
          })}
        </p>
        <p className="text-right text-xs text-muted-foreground">
          {formatFinanceMoney(subscription.monthlyEquivalent, {
            ...display,
            currency: subscription.currency,
          })}{" "}
          /mes
        </p>
      </div>

      {isActive ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{nextChargeLabel(subscription.daysUntil)}</span>
            <span>
              {progress.elapsedDays}/{progress.cycleDays} días
            </span>
          </div>
          <div className={CYCLE_TRACK_CLASS}>
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "flex items-center gap-2 text-xs text-muted-foreground",
          !paymentChip && "italic"
        )}
      >
        <MethodIcon className="size-3.5 shrink-0" />
        <span className="truncate">{paymentChip ?? "Sin método de pago"}</span>
        {method?.institution ? (
          <span className="truncate text-muted-foreground/70">
            · {method.institution}
          </span>
        ) : null}
      </div>
    </Link>
  )
}
