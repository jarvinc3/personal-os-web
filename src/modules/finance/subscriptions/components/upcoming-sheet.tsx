"use client"

import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { ListSkeleton } from "@/src/shared/components/feedback/list-skeleton"
import { useSubscriptionsUpcoming } from "@/src/modules/finance/shared/hooks/use-subscriptions"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import {
  subscriptionChargeSummary,
  subscriptionChargeSummaryLabel,
} from "@/src/modules/finance/subscriptions/lib/subscription-calendar"
import { upcomingChargeToCardSource } from "@/src/modules/finance/subscriptions/lib/subscription-card-source"
import { SubscriptionCard } from "@/src/modules/finance/subscriptions/components/subscription-card"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { ClockIcon } from "lucide-react"

type UpcomingSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isEnabled: boolean
  display: FinanceMoneyDisplay
  today: Date
  /** Warning window in days, from the global setting. */
  windowDays: number
}

/** Charges that fall inside the warning window, with its total. */
export function UpcomingSheet({
  open,
  onOpenChange,
  isEnabled,
  display,
  today,
  windowDays,
}: UpcomingSheetProps) {
  const query = useSubscriptionsUpcoming(isEnabled && open, {
    days: windowDays,
  })
  const charges = query.data?.items ?? []
  const summaryLabel = subscriptionChargeSummaryLabel({
    summary: subscriptionChargeSummary({
      charges,
      baseCurrency: display.currency,
    }),
    showCents: display.showCents,
    locale: display.locale,
  })

  return (
    <BottomSheet
      closeLabel="Cerrar"
      open={open}
      onOpenChange={onOpenChange}
      title="Próximos cobros"
      description={`Próximos ${windowDays} días · ${summaryLabel}`}
    >
      {query.isError ? (
        <ErrorState
          message={financeErrorMessage(query.error)}
          onRetry={() => void query.refetch()}
          isRetrying={query.isFetching}
        />
      ) : null}
      {query.isPending && !query.data ? <ListSkeleton rows={3} /> : null}
      {!query.isPending && charges.length === 0 ? (
        <Empty className="py-6">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClockIcon />
            </EmptyMedia>
            <EmptyTitle>Sin cobros próximos</EmptyTitle>
            <EmptyDescription>
              Ninguna suscripción cobra en los próximos {windowDays} días. Si
              alguna tiene la fecha vencida, la verás marcada como «Vencida» en
              la lista.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}
      <div className="flex flex-col gap-2">
        {charges.map((charge) => (
          <SubscriptionCard
            key={charge.id}
            subscription={upcomingChargeToCardSource(charge)}
            display={display}
            today={today}
            windowDays={windowDays}
            variant="compact"
          />
        ))}
      </div>
      <p className="pt-1 text-center text-xs text-muted-foreground">
        Ventana de aviso: {windowDays} días · cámbiala en Ajustes ›
        Suscripciones
      </p>
    </BottomSheet>
  )
}
