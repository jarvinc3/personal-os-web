"use client"

import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import { formatPlanningDate } from "@/src/modules/finance/shared/lib/planning-lists"
import { useSubscriptionPayments } from "@/src/modules/finance/shared/hooks/use-subscriptions"
import type { FinanceSubscriptionPaymentSource } from "@/src/modules/finance/shared/types/entities"
import { BanknoteArrowDownIcon, HandCoinsIcon } from "lucide-react"
import { SummaryItem, SummarySection } from "@/src/shared/components/ui/summary"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { InfiniteListSentinel } from "@/src/shared/components/ui/infinite-list-sentinel"
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
        <FinanceErrorState
          message={financeErrorMessage(paymentsQuery.error)}
          onRetry={() => void paymentsQuery.refetch()}
          isRetrying={paymentsQuery.isFetching}
        />
      ) : null}
      <AsyncRegion
        pending={paymentsQuery.isPending && !paymentsQuery.data}
        pendingFallback={<FinanceListSkeleton rows={3} />}
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
        {payments.map((payment, index) => (
          <SummaryItem
            key={payment.id}
            title={formatFinanceMoney(payment.amount, {
              ...display,
              currency: payment.currency,
            })}
            description={`${formatPlanningDate(payment.paidAt)} · ${PAYMENT_SOURCE_LABEL[payment.source]}`}
            href={
              payment.transaction
                ? APP_ROUTES.app.financeTransaction(payment.transaction.id)
                : undefined
            }
            showChevron={Boolean(payment.transaction)}
            isLast={index === payments.length - 1}
          />
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
