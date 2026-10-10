"use client"

import { FinanceAuthenticatedPage } from "@/src/modules/finance/components/layout/finance-authenticated-page"
import { FinanceErrorState } from "@/src/modules/finance/components/layout/finance-error-state"
import { FinanceListSkeleton } from "@/src/modules/finance/components/layout/finance-list-skeleton"
import { ReceivablePaymentSheet } from "@/src/modules/finance/components/planning/receivable-payment-sheet"
import { ReceivableSheet } from "@/src/modules/finance/components/planning/receivable-sheet"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/constants/sheet-keys"
import { useFinanceEnabled } from "@/src/modules/finance/hooks/use-finance-enabled"
import {
  useReceivablePayments,
  useReceivables,
} from "@/src/modules/finance/hooks/use-receivables"
import { financeLoadErrorMessage } from "@/src/modules/finance/lib/finance-error"
import {
  formatFinanceMoney,
  parseFinanceMoney,
} from "@/src/modules/finance/lib/money"
import {
  amountRatioPct,
  formatPlanningDate,
} from "@/src/modules/finance/lib/planning-lists"
import {
  FINANCE_RECEIVABLE_STATUS_LABEL,
  type FinanceReceivableStatus,
} from "@/src/modules/finance/types/entities"
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

export function FinanceReceivableDetailClient({
  receivableId,
}: FinanceReceivableDetailProps) {
  return (
    <FinanceAuthenticatedPage>
      <FinanceReceivableDetailView receivableId={receivableId} />
    </FinanceAuthenticatedPage>
  )
}

function FinanceReceivableDetailView({
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
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HandshakeIcon />
          </EmptyMedia>
          <EmptyTitle>No encontramos este cobro</EmptyTitle>
          <EmptyDescription>
            Puede que se haya borrado o archivado.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            variant="outline"
            onClick={() => router.push(APP_ROUTES.app.financePlanning)}
          >
            Volver a Planificación
          </Button>
        </EmptyContent>
      </Empty>
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

      <div className="-mx-4 -mt-4 overflow-hidden md:-mx-6">
        <div
          className="rounded-b-3xl p-4 text-white md:p-6"
          style={{ background: ACCENT_FALLBACK_COLOR }}
        >
          <div className="flex items-start gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/20">
              <HandshakeIcon className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <h1 className="truncate text-2xl font-bold tracking-tight">
                  {receivable.debtorName}
                </h1>
                <Badge
                  variant={STATUS_VARIANT[receivable.status]}
                  className="shrink-0"
                >
                  {FINANCE_RECEIVABLE_STATUS_LABEL[receivable.status]}
                </Badge>
              </div>
              {receivable.description ? (
                <p className="mt-1 truncate text-sm text-white/70">
                  {receivable.description}
                </p>
              ) : null}
            </div>
          </div>

          <p className="mt-8 text-[11px] tracking-wide text-white/60 uppercase">
            Cobrado
          </p>
          <p className="text-3xl font-bold tracking-tight tabular-nums">
            {formatFinanceMoney(receivable.paidAmount, money)}
          </p>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex flex-wrap justify-between gap-x-3 text-xs text-white/70">
            <span>{Math.round(progress)}% cobrado</span>
            <span>Total {formatFinanceMoney(receivable.amount, money)}</span>
          </div>
          {outstanding > 0 ? (
            <p className="mt-3 text-sm text-white/80">
              Queda por cobrar {formatFinanceMoney(outstanding, money)}
              {receivable.dueDate
                ? ` · vence ${formatPlanningDate(receivable.dueDate)}`
                : ""}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mx-4 flex flex-col gap-3 rounded-3xl bg-background">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">Cobros</h2>
          {outstanding > 0 ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setOpenPaymentSheet(true)}
            >
              <PlusIcon className="size-4" />
              Cobro
            </Button>
          ) : null}
        </div>

        {paymentsQuery.isError ? (
          <FinanceErrorState
            message={financeLoadErrorMessage(paymentsQuery.error)}
            onRetry={() => void paymentsQuery.refetch()}
            isRetrying={paymentsQuery.isFetching}
          />
        ) : null}

        {paymentsQuery.isPending ? <FinanceListSkeleton rows={4} /> : null}

        {!paymentsQuery.isPending && payments.length === 0 ? (
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
        ) : null}

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
