"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import {
  billingCycleLabel,
  subscriptionCardState,
  subscriptionStatusBadge,
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
  onPress?: () => void
  /** Variante de la card; la galería /dev/cards la pinta (#272). */
  variant?: "full" | "compact" | "inline"
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
  onPress,
  variant = "full",
}: SubscriptionCardProps) {
  const state = subscriptionCardState({ subscription, today, windowDays })
  const statusBadge = subscriptionStatusBadge(subscription, state.overdue)
  const progress = subscriptionCycleProgress(subscription, today)
  const money = { ...display, currency: subscription.currency }
  const categoryLabel =
    subscription.category?.name ??
    billingCycleLabel(subscription.billingCycle, subscription.billingInterval)

  const shellClassName = cn(
    "relative flex text-left transition-colors",
    variant === "full" &&
      cn(
        "flex-col gap-3 rounded-2xl bg-card p-4 hover:bg-muted/40",
        state.inWindow ? "border-2 border-warning" : "border border-border"
      ),
    variant === "compact" &&
      cn(
        "items-center rounded-xl border bg-card p-2.5 hover:bg-muted/40",
        state.inWindow ? "border-2 border-warning" : "border-border"
      ),
    variant === "inline" && "inline-flex max-w-full min-w-0 items-center",
    onPress && "cursor-pointer"
  )

  if (variant === "inline") {
    const inlineBody = (
      <>
        <SubscriptionProgressRing
          percent={progress.percent}
          size={16}
          tone={state.inWindow ? "warning" : "primary"}
        >
          <BrandLogo
            name={subscription.name}
            logoUrl={subscription.logoUrl}
            size={16}
          />
        </SubscriptionProgressRing>
        <span className="min-w-0 truncate text-sm font-medium">
          {subscription.name}
        </span>
        {state.inWindow ? (
          <TriangleAlertIcon
            className="size-3.5 shrink-0 text-warning"
            aria-hidden
          />
        ) : null}
      </>
    )

    if (onPress) {
      return (
        <button
          type="button"
          onClick={onPress}
          className={cn(shellClassName, "ml-1.5 gap-1.5")}
        >
          {inlineBody}
        </button>
      )
    }

    return (
      <Link
        href={APP_ROUTES.app.financeSubscription(subscription.id)}
        className={cn(shellClassName, "ml-1.5 gap-1.5")}
      >
        {inlineBody}
      </Link>
    )
  }

  if (variant === "compact") {
    const compactBody = (
      <>
        <SubscriptionProgressRing
          percent={progress.percent}
          size={26}
          tone={state.inWindow ? "warning" : "primary"}
        >
          <BrandLogo
            name={subscription.name}
            logoUrl={subscription.logoUrl}
            size={26}
          />
        </SubscriptionProgressRing>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate text-sm font-semibold">
              {subscription.name}
            </span>
            <span className="shrink-0 text-sm font-bold tabular-nums">
              {state.onTrial
                ? "Gratis"
                : formatFinanceMoney(subscription.amount, money)}
            </span>
          </span>
          <span className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <span className="flex min-w-0 items-center gap-1">
              {subscription.status !== "ACTIVE" ? (
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
              ) : (
                <span className="truncate">{categoryLabel}</span>
              )}
            </span>
            <span className="flex shrink-0 items-center gap-1">
              {state.warnLastCharge ? (
                <TriangleAlertIcon
                  className="size-3.5 text-warning"
                  aria-hidden
                />
              ) : null}
              <span>{state.label}</span>
            </span>
          </span>
        </span>
      </>
    )

    if (onPress) {
      return (
        <button
          type="button"
          onClick={onPress}
          className={cn(shellClassName, "gap-2.5")}
        >
          {compactBody}
        </button>
      )
    }

    return (
      <Link
        href={APP_ROUTES.app.financeSubscription(subscription.id)}
        className={cn(shellClassName, "gap-2.5")}
      >
        {compactBody}
        <LinkPendingOverlay />
      </Link>
    )
  }

  const fullBody = (
    <>
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
        {state.overdue || subscription.status !== "ACTIVE" ? (
          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
        ) : null}
      </div>
    </>
  )

  if (onPress) {
    return (
      <button type="button" onClick={onPress} className={shellClassName}>
        {fullBody}
      </button>
    )
  }

  return (
    <Link
      href={APP_ROUTES.app.financeSubscription(subscription.id)}
      className={shellClassName}
    >
      {fullBody}
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
