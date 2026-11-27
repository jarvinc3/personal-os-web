"use client"

import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { useSubscriptionPayments } from "@/src/modules/finance/shared/hooks/use-subscriptions"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import type { FinanceSubscription } from "@/src/modules/finance/shared/types/entities"
import { billingCycleLabel } from "@/src/modules/finance/subscriptions/lib/subscription-display"
import {
  priceChangeOverMonths,
  subscriptionPriceHistory,
} from "@/src/modules/finance/subscriptions/lib/subscription-price"
import { SubscriptionPriceChart } from "@/src/modules/finance/subscriptions/components/subscription-price-chart"
import { useMemo } from "react"
import { LineChartIcon } from "lucide-react"
import {
  SummaryItem,
  SummarySection,
} from "@/src/shared/components/data-display/summary"
import { Badge } from "@/src/shared/components/ui/badge"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"

type SubscriptionPriceTabProps = {
  subscription: FinanceSubscription
  subscriptionId: string
  enabled: boolean
  money: FinanceMoneyDisplay
  today: Date
}

export function SubscriptionPriceTab({
  subscription,
  subscriptionId,
  enabled,
  money,
  today,
}: SubscriptionPriceTabProps) {
  const paymentsQuery = useSubscriptionPayments(enabled, subscriptionId)
  const payments = infiniteListItems(paymentsQuery.data)
  const priceHistory = useMemo(
    () => subscriptionPriceHistory(payments),
    [payments]
  )
  const changeOverYear = priceChangeOverMonths({
    series: priceHistory.series,
    months: 12,
    today,
  })

  return (
    <SummarySection
      title="Precio"
      icon={LineChartIcon}
      right={
        changeOverYear === null ? null : (
          <Badge variant={changeOverYear > 0 ? "danger" : "success"}>
            {changeOverYear > 0 ? "+" : ""}
            {changeOverYear}% en 12 meses
          </Badge>
        )
      }
    >
      {paymentsQuery.isError ? (
        <ErrorState
          message={financeErrorMessage(paymentsQuery.error)}
          onRetry={() => void paymentsQuery.refetch()}
          isRetrying={paymentsQuery.isFetching}
        />
      ) : null}
      <AsyncRegion
        pending={paymentsQuery.isPending && !paymentsQuery.data}
        pendingFallback={
          <div className="flex flex-col gap-2 px-3 py-2" aria-hidden>
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        }
        empty={priceHistory.series.length === 0}
        emptyFallback={
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <LineChartIcon />
              </EmptyMedia>
              <EmptyTitle>Sin historial de precio</EmptyTitle>
              <EmptyDescription>
                Cuando se registren cobros, aquí verás cómo cambió el monto.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        }
      >
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-2xl font-bold tabular-nums">
            {formatFinanceMoney(subscription.amount, money)}
          </span>
          <span className="text-xs text-muted-foreground">
            {billingCycleLabel(
              subscription.billingCycle,
              subscription.billingInterval
            ).toLowerCase()}
          </span>
        </div>
        <SubscriptionPriceChart series={priceHistory.series} display={money} />
        <div className="flex flex-col">
          {priceHistory.changes.map((change, index) => (
            <SummaryItem
              key={change.date}
              title={formatCalendarDate(change.date, money.locale)}
              description={
                change.previousAmount === null
                  ? "Inicio"
                  : `Detectado en el cobro${
                      change.percent === null
                        ? ""
                        : ` · ${change.percent > 0 ? "+" : ""}${change.percent}%`
                    }`
              }
              value={
                change.previousAmount === null
                  ? formatFinanceMoney(change.amount, money)
                  : `${formatFinanceMoney(change.previousAmount, money)} → ${formatFinanceMoney(change.amount, money)}`
              }
              isLast={index === priceHistory.changes.length - 1}
            />
          ))}
        </div>
      </AsyncRegion>
    </SummarySection>
  )
}
