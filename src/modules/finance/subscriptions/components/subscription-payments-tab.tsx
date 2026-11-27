"use client"

import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import { useSubscriptionPayments } from "@/src/modules/finance/shared/hooks/use-subscriptions"
import type { FinanceSubscriptionPaymentSource } from "@/src/modules/finance/shared/types/entities"
import { BanknoteArrowDownIcon, HandCoinsIcon } from "lucide-react"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { Button } from "@/src/shared/components/ui/button"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/src/shared/components/ui/item"
import { LinkPendingOverlay } from "@/src/shared/components/shell/navigation-pending"
import Link from "next/link"
import { InfiniteListSentinel } from "@/src/shared/components/feedback/infinite-list-sentinel"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"

const PAYMENT_SOURCE_LABEL: Record<FinanceSubscriptionPaymentSource, string> = {
  AUTO: "Automático",
  MANUAL: "Manual",
}

type SubscriptionPaymentsTabProps = {
  subscriptionId: string
  enabled: boolean
  display: FinanceMoneyDisplay
  canRegister: boolean
  onRegister: () => void
}

export function SubscriptionPaymentsTab({
  subscriptionId,
  enabled,
  display,
  canRegister,
  onRegister,
}: SubscriptionPaymentsTabProps) {
  const paymentsQuery = useSubscriptionPayments(enabled, subscriptionId)
  const payments = infiniteListItems(paymentsQuery.data)

  return (
    <SummarySection
      title="Pagos"
      icon={HandCoinsIcon}
      right={
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={!canRegister}
          onClick={onRegister}
        >
          <BanknoteArrowDownIcon className="size-4 shrink-0" />
          Registrar pago
        </Button>
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
        empty={payments.length === 0}
        emptyFallback={
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HandCoinsIcon />
              </EmptyMedia>
              <EmptyTitle>Sin pagos registrados</EmptyTitle>
              <EmptyDescription>
                Los cobros que coincidan se registran solos; también puedes
                añadirlos a mano.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        }
      >
        {payments.map((payment) => (
          <Item
            key={payment.id}
            variant={payment.transaction ? "default" : "plain"}
            render={
              payment.transaction ? (
                <Link
                  href={APP_ROUTES.app.financeTransaction(
                    payment.transaction.id
                  )}
                />
              ) : undefined
            }
          >
            <ItemContent>
              <ItemTitle>
                {formatFinanceMoney(payment.amount, {
                  ...display,
                  currency: payment.currency,
                })}
              </ItemTitle>
              <ItemDescription className="truncate text-xs">
                {`${formatCalendarDate(payment.paidAt, display.locale)} · ${PAYMENT_SOURCE_LABEL[payment.source]}`}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <LinkPendingOverlay />
            </ItemActions>
          </Item>
        ))}
      </AsyncRegion>
      <InfiniteListSentinel
        hasNextPage={paymentsQuery.hasNextPage}
        isFetchingNextPage={paymentsQuery.isFetchingNextPage}
        onLoadMore={() => void paymentsQuery.fetchNextPage()}
      />
    </SummarySection>
  )
}
