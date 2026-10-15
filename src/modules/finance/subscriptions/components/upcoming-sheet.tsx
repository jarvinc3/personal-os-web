"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import { useSubscriptionsUpcoming } from "@/src/modules/finance/shared/hooks/use-subscriptions"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import {
  subscriptionChargeSummary,
  subscriptionChargeSummaryLabel,
} from "@/src/modules/finance/subscriptions/lib/subscription-calendar"
import { billingLabel } from "@/src/modules/finance/subscriptions/lib/subscription-timing"
import type { FinanceSubscriptionUpcomingCharge } from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { Button } from "@/src/shared/components/ui/button"
import { LinkPendingOverlay } from "@/src/shared/components/ui/navigation-pending"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { ClockIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"

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
  })

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Próximos cobros"
      description={`Próximos ${windowDays} días · ${summaryLabel}`}
      actions={{
        close: (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4 shrink-0" />
            Cerrar
          </Button>
        ),
      }}
    >
      {query.isError ? (
        <FinanceErrorState
          message={financeErrorMessage(query.error)}
          onRetry={() => void query.refetch()}
          isRetrying={query.isFetching}
        />
      ) : null}
      {query.isPending && !query.data ? <FinanceListSkeleton rows={3} /> : null}
      {!query.isPending && charges.length === 0 ? (
        <Empty className="py-6">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClockIcon />
            </EmptyMedia>
            <EmptyTitle>Sin cobros próximos</EmptyTitle>
            <EmptyDescription>
              Ninguna suscripción cobra en los próximos {windowDays} días.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}
      <div className="flex flex-col gap-2">
        {charges.map((charge) => (
          <UpcomingChargeRow
            key={charge.id}
            charge={charge}
            display={display}
            today={today}
            windowDays={windowDays}
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

type UpcomingChargeRowProps = {
  charge: FinanceSubscriptionUpcomingCharge
  display: FinanceMoneyDisplay
  today: Date
  windowDays: number
}

function UpcomingChargeRow({
  charge,
  display,
  today,
  windowDays,
}: UpcomingChargeRowProps) {
  const label = billingLabel({ nextDate: charge.date, today, windowDays })
  const method = charge.paymentMethod
  const last4 = method?.last4 ? ` ••${method.last4}` : ""
  return (
    <Link
      href={APP_ROUTES.app.financeSubscription(charge.subscriptionId)}
      className="relative flex items-center gap-3 rounded-2xl border border-warning/50 bg-warning/5 p-3"
    >
      <BrandLogo name={charge.name} logoUrl={charge.logoUrl} size={32} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{charge.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {charge.date} · {method ? `${method.name}${last4}` : "Sin método"}
        </p>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-sm font-semibold tabular-nums">
          {formatFinanceMoney(charge.amount, {
            ...display,
            currency: charge.currency,
          })}
        </span>
        <span className="text-xs font-medium text-warning">{label.text}</span>
      </div>
      <LinkPendingOverlay />
    </Link>
  )
}
