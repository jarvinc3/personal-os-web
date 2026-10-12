"use client"

import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { MissingRecord } from "@/src/modules/finance/shared/components/layout/missing-record"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import { FinanceProgressHero } from "@/src/modules/finance/shared/components/layout/progress-hero"
import { ReceivablePaymentSheet } from "@/src/modules/finance/receivables/components/receivable-payment-sheet"
import { ReceivableSheet } from "@/src/modules/finance/receivables/components/receivable-sheet"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import {
  useReceivablePayments,
  useReceivables,
} from "@/src/modules/finance/shared/hooks/use-receivables"
import { financeLoadErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import {
  formatFinanceMoney,
  parseFinanceMoney,
} from "@/src/modules/finance/shared/lib/money"
import {
  amountRatioPct,
  formatPlanningDate,
} from "@/src/modules/finance/shared/lib/planning-lists"
import {
  FINANCE_RECEIVABLE_STATUS_LABEL,
  type FinanceReceivableStatus,
} from "@/src/modules/finance/shared/types/entities"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Badge } from "@/src/shared/components/ui/badge"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { SummaryItem } from "@/src/shared/components/ui/summary"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { HandshakeIcon, MoreVerticalIcon, PlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo } from "react"

import { ACCENT_FALLBACK_COLOR } from "@/src/shared/lib/accent-gradient"

const STATUS_VARIANT: Record<
  FinanceReceivableStatus,
  "success" | "info" | "warning" | "secondary"
> = {
  PENDING: "warning",
  PARTIAL: "info",
  PAID: "success",
  CANCELLED: "secondary",
}

type FinanceReceivableDetailProps = {
  receivableId: string
}

export function ReceivableDetailScreen({
  receivableId,
}: FinanceReceivableDetailProps) {
  return (
    <FinanceGate>
      <ReceivableDetailScreenBody receivableId={receivableId} />
    </FinanceGate>
  )
}

function ReceivableDetailScreenBody({
  receivableId,
}: FinanceReceivableDetailProps) {
  const router = useRouter()
  const { isEnabled, config } = useFinanceEnabled()
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }

  const receivablesQuery = useReceivables(isEnabled)
  const paymentsQuery = useReceivablePayments(isEnabled, receivableId)
  const { open: openReceivableSheet, setOpen: setOpenReceivableSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.receivable)
  const { open: openPaymentSheet, setOpen: setOpenPaymentSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.receivablePayment)

  const receivable =
    (receivablesQuery.data ?? []).find((item) => item.id === receivableId) ??
    null
  const payments = paymentsQuery.data ?? []
  const money = {
    ...display,
    currency: receivable?.currency ?? display.currency,
  }
  const progress = Math.min(
    100,
    Math.max(0, amountRatioPct(receivable?.paidAmount, receivable?.amount) ?? 0)
  )
  const outstanding = receivable
    ? (parseFinanceMoney(receivable.amount) ?? 0) -
      (parseFinanceMoney(receivable.paidAmount) ?? 0)
    : 0

  const headerActions = useMemo(
    () => (
      <Button
        variant="outline"
        size="icon"
        className="size-9 rounded-full"
        aria-label="Opciones del cobro"
        onClick={() => setOpenReceivableSheet(true)}
      >
        <MoreVerticalIcon className="size-4.5" />
      </Button>
    ),
    [setOpenReceivableSheet]
  )

  usePageHeader(
    {
      variant: "secondary",
      title: receivable?.debtorName ?? "Cobro",
      onBack: () => router.back(),
      actions: headerActions,
      accentColor: ACCENT_FALLBACK_COLOR,
    },
    [router, receivable?.debtorName, headerActions]
  )

  if (receivablesQuery.isPending && !receivable) {
    return <LoadingView />
  }

  if (!receivable) {
    return (
      <MissingRecord
        icon={HandshakeIcon}
        title="No encontramos este cobro"
        description="Puede que se haya borrado o archivado."
        backHref={APP_ROUTES.app.financePlanning}
        backLabel="Volver a Planificación"
      />
    )
  }

  return (
    <>
      {receivablesQuery.error ? (
        <div className="mb-3">
          <FinanceErrorState
            message={financeLoadErrorMessage(receivablesQuery.error)}
            onRetry={() => void receivablesQuery.refetch()}
            isRetrying={receivablesQuery.isFetching}
          />
        </div>
      ) : null}

      <FinanceProgressHero
        accent={ACCENT_FALLBACK_COLOR}
        media={
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/20">
            <HandshakeIcon className="size-6" />
          </span>
        }
        title={receivable.debtorName}
        badge={{
          label: FINANCE_RECEIVABLE_STATUS_LABEL[receivable.status],
          variant: STATUS_VARIANT[receivable.status],
        }}
        subtitle={receivable.description ?? undefined}
        metricLabel="Cobrado"
        metricValue={formatFinanceMoney(receivable.paidAmount, money)}
        progress={progress}
        startCaption={`${Math.round(progress)}% cobrado`}
        endCaption={`Total ${formatFinanceMoney(receivable.amount, money)}`}
        footnote={
          outstanding > 0
            ? `Queda por cobrar ${formatFinanceMoney(outstanding, money)}${
                receivable.dueDate
                  ? ` · vence ${formatPlanningDate(receivable.dueDate)}`
                  : ""
              }`
            : undefined
        }
      />

      <div className="mx-4 flex flex-col gap-3 rounded-3xl bg-background">
        {paymentsQuery.isError ? (
          <FinanceErrorState
            message={financeLoadErrorMessage(paymentsQuery.error)}
            onRetry={() => void paymentsQuery.refetch()}
            isRetrying={paymentsQuery.isFetching}
          />
        ) : null}

        <AsyncRegion
          pending={paymentsQuery.isPending}
          pendingFallback={<FinanceListSkeleton rows={4} />}
          empty={!paymentsQuery.isError && payments.length === 0}
          emptyFallback={
            <Empty className="py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HandshakeIcon />
                </EmptyMedia>
                <EmptyTitle>Sin cobros registrados</EmptyTitle>
                <EmptyDescription>
                  Cada cobro entra como ingreso en la cuenta que elijas, así que
                  el saldo y tus movimientos cuentan lo mismo.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => setOpenPaymentSheet(true)}>
                  <PlusIcon />
                  Cobro
                </Button>
              </EmptyContent>
            </Empty>
          }
        >
          {payments.length > 0 ? (
            <div className="rounded-2xl border border-border bg-card">
              {payments.map((payment, index) => (
                <SummaryItem
                  key={payment.id}
                  title={formatFinanceMoney(payment.amount, money)}
                  description={[
                    formatPlanningDate(payment.paidAt),
                    payment.account?.name ?? "Cuenta eliminada",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                  trailing={
                    payment.transactionId ? (
                      <Badge variant="secondary">Ingreso</Badge>
                    ) : (
                      <Badge variant="secondary">Saldo inicial</Badge>
                    )
                  }
                  isLast={index === payments.length - 1}
                />
              ))}
            </div>
          ) : null}
        </AsyncRegion>

        {payments.length > 0 ? (
          <p className="px-1 text-xs text-muted-foreground">
            Para deshacer un cobro, borra el movimiento que creó en Movimientos:
            el saldo se corrige solo.
          </p>
        ) : null}
      </div>

      <ReceivablePaymentSheet
        open={openPaymentSheet}
        onOpenChange={setOpenPaymentSheet}
        receivableId={receivable.id}
        debtorName={receivable.debtorName}
        currency={receivable.currency}
        display={money}
        outstandingLabel={
          outstanding > 0 ? formatFinanceMoney(outstanding, money) : undefined
        }
      />

      <ReceivableSheet
        open={openReceivableSheet}
        onOpenChange={setOpenReceivableSheet}
        receivable={receivable}
        defaultCurrency={display.currency}
        pending={receivablesQuery.isFetching}
      />
    </>
  )
}
