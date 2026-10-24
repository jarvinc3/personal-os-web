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
  type SubscriptionCardState,
} from "@/src/modules/finance/subscriptions/lib/subscription-display"
import {
  subscriptionCycleProgress,
  type SubscriptionCycleProgress,
} from "@/src/modules/finance/subscriptions/lib/subscription-timing"
import { SubscriptionProgressRing } from "@/src/modules/finance/subscriptions/components/subscription-progress-ring"
import type { SubscriptionCardSource } from "@/src/modules/finance/subscriptions/lib/subscription-card-source"
import { CardProductRow } from "@/src/modules/finance/shared/components/product-rows"
import type {
  FinanceAccount,
  FinanceCard,
} from "@/src/modules/finance/shared/types/entities"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { Badge } from "@/src/shared/components/ui/badge"
import { LinkPendingOverlay } from "@/src/shared/components/ui/navigation-pending"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { CheckIcon, TriangleAlertIcon } from "lucide-react"
import Link from "next/link"

type SubscriptionCardProps = {
  subscription: SubscriptionCardSource
  display: FinanceMoneyDisplay
  /** Entities that resolve the payment method into a card. */
  cards?: readonly FinanceCard[]
  accounts?: readonly FinanceAccount[]
  today: Date
  /** Warning window in days, from the global setting. */
  windowDays: number
  onPress?: () => void
  /** Destination; `null` leaves a plain surface. Defaults to the detail. */
  href?: string | null
  disabled?: boolean
  /** Ring and check mark while the card is picked in a selector. */
  selected?: boolean
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
  cards = [],
  accounts = [],
  today,
  windowDays,
  onPress,
  href,
  disabled = false,
  selected = false,
  variant = "full",
}: SubscriptionCardProps) {
  const paymentMethod = subscription.paymentMethod
  const paymentCard =
    paymentMethod?.type === "CARD"
      ? (cards.find((card) => card.id === paymentMethod.id) ?? null)
      : null
  const state = subscriptionCardState({ subscription, today, windowDays })
  const statusBadge = subscriptionStatusBadge(subscription, state.overdue)
  const progress = subscriptionCycleProgress(subscription, today)
  const money = { ...display, currency: subscription.currency }
  const targetHref =
    href !== undefined
      ? href
      : onPress === undefined
        ? APP_ROUTES.app.financeSubscription(subscription.id)
        : null
  const interactive = !disabled && (targetHref !== null || Boolean(onPress))

  const body =
    variant === "inline" ? (
      <InlineBody
        subscription={subscription}
        progress={progress}
        state={state}
      />
    ) : variant === "compact" ? (
      <CompactBody
        subscription={subscription}
        money={money}
        statusBadge={statusBadge}
        state={state}
        progress={progress}
        selected={selected}
      />
    ) : (
      <FullBody
        subscription={subscription}
        money={money}
        display={display}
        accounts={accounts}
        paymentCard={paymentCard}
        statusBadge={statusBadge}
        state={state}
        progress={progress}
        selected={selected}
      />
    )

  const className = cn(
    "relative flex text-left transition-colors",
    variant === "full" && "flex-col gap-3 rounded-2xl bg-card p-4",
    variant === "compact" && "items-center gap-2.5 rounded-xl bg-card p-2.5",
    variant === "inline" &&
      "inline-flex max-w-full min-w-0 items-center gap-1.5 align-middle",
    variant !== "inline" &&
      (state.inWindow ? "border-2 border-warning" : "border border-border"),
    selected &&
      variant !== "inline" &&
      "ring-2 ring-primary ring-offset-2 ring-offset-background",
    disabled && "pointer-events-none opacity-50",
    interactive &&
      cn(
        PRESSABLE_CLASS,
        variant !== "inline" && "hover:bg-muted/40",
        variant === "inline" && "ml-1.5"
      )
  )

  if (targetHref !== null && !disabled) {
    return (
      <Link href={targetHref} className={className}>
        {body}
        <LinkPendingOverlay />
      </Link>
    )
  }

  if (onPress) {
    return (
      <button
        type="button"
        onClick={onPress}
        disabled={disabled}
        className={className}
      >
        {body}
      </button>
    )
  }

  if (variant === "inline") {
    return <span className={className}>{body}</span>
  }

  return <div className={className}>{body}</div>
}

type CardBodyProps = {
  subscription: SubscriptionCardSource
  state: SubscriptionCardState
  progress: SubscriptionCycleProgress | null
  selected: boolean
}

function InlineBody({
  subscription,
  state,
  progress,
}: Pick<CardBodyProps, "subscription" | "state" | "progress">) {
  return (
    <>
      <SubscriptionProgressRing
        percent={progress?.percent ?? 0}
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
}

type CompactBodyProps = CardBodyProps & {
  money: FinanceMoneyDisplay
  statusBadge: ReturnType<typeof subscriptionStatusBadge>
}

function CompactBody({
  subscription,
  money,
  state,
  statusBadge,
  progress,
  selected,
}: CompactBodyProps) {
  return (
    <>
      <SubscriptionProgressRing
        percent={progress?.percent ?? 0}
        size={24}
        tone={state.inWindow ? "warning" : "primary"}
      >
        <BrandLogo
          name={subscription.name}
          logoUrl={subscription.logoUrl}
          size={24}
        />
      </SubscriptionProgressRing>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center justify-between gap-2">
          <span className="min-w-0 truncate text-sm font-semibold">
            {subscription.name}
          </span>
          <span className="flex shrink-0 items-baseline gap-0.5 text-sm font-bold tabular-nums">
            {state.onTrial ? (
              "Gratis"
            ) : (
              <>
                {formatFinanceMoney(subscription.amount, money)}
                {isMonthlyCharge(subscription) ? (
                  <span className="text-[10px] font-medium text-muted-foreground">
                    /mes
                  </span>
                ) : null}
              </>
            )}
          </span>
        </span>
        <span className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span className="flex min-w-0 items-center gap-1">
            {state.warnLastCharge ? (
              <TriangleAlertIcon
                className="size-3.5 shrink-0 text-warning"
                aria-hidden
              />
            ) : null}
            <span className="truncate">{state.label}</span>
          </span>
          {state.overdue || subscription.status !== "ACTIVE" ? (
            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          ) : null}
        </span>
      </span>
      {selected ? <SelectedMark /> : null}
    </>
  )
}

type FullBodyProps = CardBodyProps & {
  money: FinanceMoneyDisplay
  display: FinanceMoneyDisplay
  accounts: readonly FinanceAccount[]
  paymentCard: FinanceCard | null
  statusBadge: ReturnType<typeof subscriptionStatusBadge>
}

function FullBody({
  subscription,
  money,
  display,
  accounts,
  paymentCard,
  state,
  statusBadge,
  progress,
  selected,
}: FullBodyProps) {
  const categoryLabel = cardCategoryLabel(subscription)

  return (
    <>
      <div className="flex items-start gap-3">
        <SubscriptionProgressRing
          percent={progress?.percent ?? 0}
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
          {categoryLabel ? (
            <p className="truncate text-xs text-muted-foreground">
              {categoryLabel}
            </p>
          ) : null}
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
              {isMonthlyCharge(subscription) ? (
                <span className="text-xs font-medium text-muted-foreground">
                  /mes
                </span>
              ) : subscription.billingCycle !== null &&
                subscription.monthlyEquivalent !== null ? (
                <span className="text-xs font-medium text-muted-foreground">
                  ≈ {formatFinanceMoney(subscription.monthlyEquivalent, money)}
                  /mes
                </span>
              ) : null}
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
        {paymentCard ? (
          <div className="min-w-0 flex-1">
            <CardProductRow
              card={paymentCard}
              accounts={accounts}
              display={display}
              variant="compact"
            />
          </div>
        ) : (
          <span className="truncate text-xs text-muted-foreground">
            {paymentMethodLabel(subscription) ?? "Sin método de pago"}
          </span>
        )}
        {state.overdue || subscription.status !== "ACTIVE" ? (
          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
        ) : null}
        {selected ? <SelectedMark /> : null}
      </div>
    </>
  )
}

function SelectedMark() {
  return (
    <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
      <CheckIcon className="size-3.5" aria-hidden />
    </span>
  )
}

/** The amount is the monthly charge when the cycle is a single month. */
function isMonthlyCharge(subscription: SubscriptionCardSource): boolean {
  return (
    subscription.billingCycle === "MONTHLY" &&
    subscription.billingInterval === 1
  )
}

/** Category of the card, or its cycle when the category is missing. */
function cardCategoryLabel(
  subscription: SubscriptionCardSource
): string | null {
  if (subscription.category?.name) {
    return subscription.category.name
  }
  if (subscription.billingCycle === null) {
    return null
  }
  return billingCycleLabel(
    subscription.billingCycle,
    subscription.billingInterval
  )
}

function paymentMethodLabel(
  subscription: SubscriptionCardSource
): string | null {
  const method = subscription.paymentMethod
  if (!method) {
    return null
  }
  const last4 = method.last4 ? ` ••${method.last4}` : ""
  return `${method.name}${last4}`
}
