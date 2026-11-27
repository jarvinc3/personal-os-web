"use client"

import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { useSubscriptionsUpcoming } from "@/src/modules/finance/shared/hooks/use-subscriptions"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import {
  subscriptionChargeSummary,
  subscriptionChargeSummaryLabel,
} from "@/src/modules/finance/subscriptions/lib/subscription-calendar"
import { upcomingChargeToCardSource } from "@/src/modules/finance/subscriptions/lib/subscription-card-source"
import { SubscriptionCard } from "@/src/modules/finance/subscriptions/components/subscription-card"
import { SheetBody } from "@/src/shared/components/sheets/sheet-body"
import { SheetHeader } from "@/src/shared/components/sheets/sheet-header"
import { SHEET_FOOTER_CLASS } from "@/src/shared/components/sheets/sheet-layout"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { SheetHelpAction } from "@/src/modules/help"
import { Button } from "@/src/shared/components/ui/button"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/src/shared/components/ui/drawer"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { ClockIcon, XIcon } from "lucide-react"

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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <SheetHeader
          title="Próximos cobros"
          description={`Próximos ${windowDays} días · ${summaryLabel}`}
          actions={
            <SheetHelpAction
              sheetKey={FINANCE_SHEET_KEYS.subscriptionUpcoming}
            />
          }
        />
        <SheetBody>
          {query.isError ? (
            <ErrorState
              message={financeErrorMessage(query.error)}
              onRetry={() => void query.refetch()}
              isRetrying={query.isFetching}
            />
          ) : null}
          {query.isPending && !query.data ? (
            <div className="flex flex-col gap-2 px-3 py-2" aria-hidden>
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : null}
          {!query.isPending && charges.length === 0 ? (
            <Empty className="py-6">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ClockIcon />
                </EmptyMedia>
                <EmptyTitle>Sin cobros próximos</EmptyTitle>
                <EmptyDescription>
                  Ninguna suscripción cobra en los próximos {windowDays} días.
                  Si alguna tiene la fecha vencida, la verás marcada como
                  «Vencida» en la lista.
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
        </SheetBody>
        <DrawerFooter className={SHEET_FOOTER_CLASS}>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4 shrink-0" aria-hidden="true" />
            Cerrar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
