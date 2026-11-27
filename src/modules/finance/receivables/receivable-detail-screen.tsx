"use client"

import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { MissingRecord } from "@/src/modules/finance/shared/components/layout/missing-record"
import { FinanceProgressHero } from "@/src/modules/finance/shared/components/layout/progress-hero"
import { ReceivablePaymentSheet } from "@/src/modules/finance/receivables/components/receivable-payment-sheet"
import { ReceivableSheet } from "@/src/modules/finance/receivables/components/receivable-sheet"
import { canRegisterReceivablePayment } from "@/src/modules/finance/receivables/lib/receivable-payment-form"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import {
  useDeleteReceivable,
  useRestoreReceivable,
  useReceivablePayments,
  useReceivables,
  useUpdateReceivable,
  useWriteOffReceivable,
} from "@/src/modules/finance/shared/hooks/use-receivables"
import {
  financeErrorMessage,
  financeLoadErrorMessage,
} from "@/src/modules/finance/shared/lib/finance-error"
import { showUndoToast } from "@/src/modules/finance/shared/components/undo-toast"
import {
  formatFinanceMoney,
  parseFinanceMoney,
} from "@/src/modules/finance/shared/lib/money"
import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import { amountRatioPct } from "@/src/modules/finance/shared/lib/planning-lists"
import {
  FINANCE_RECEIVABLE_STATUS_LABEL,
  FINANCE_RECEIVABLE_STATUS_VARIANT,
} from "@/src/modules/finance/shared/types/entities"
import { RecordOptionsSheet } from "@/src/modules/finance/shared/components/record-options-sheet"
import { Badge } from "@/src/shared/components/ui/badge"
import { Button } from "@/src/shared/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/src/shared/components/ui/alert-dialog"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { SummaryItem } from "@/src/shared/components/data-display/summary"
import { InfiniteListSentinel } from "@/src/shared/components/feedback/infinite-list-sentinel"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { appToast } from "@/src/shared/lib/app-toast"
import {
  ArchiveIcon,
  HandCoinsIcon,
  HandshakeIcon,
  MoreVerticalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

import { ACCENT_FALLBACK_COLOR } from "@/src/shared/lib/accent-gradient"

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
  const { isEnabled, config, formatLocale } = useFinanceEnabled()
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
    locale: formatLocale,
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
  const payments = infiniteListItems(paymentsQuery.data)
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
  const canRegisterPayment = receivable
    ? canRegisterReceivablePayment(receivable.status)
    : false
  const deleteReceivable = useDeleteReceivable()
  const restoreReceivable = useRestoreReceivable()
  const updateReceivable = useUpdateReceivable()
  const writeOffReceivable = useWriteOffReceivable()
  const { open: optionsOpen, setOpen: setOptionsOpen } = useSheetParam(
    FINANCE_SHEET_KEYS.receivableOptions
  )
  const [confirmOpen, setConfirmOpen] = useState(false)

  async function onWriteOff() {
    if (!receivable) {
      return
    }
    try {
      await writeOffReceivable.mutateAsync({ receivableId: receivable.id })
      appToast.success({ text1: "Deuda castigada" })
      setOptionsOpen(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  async function onCancelReceivable() {
    if (!receivable) {
      return
    }
    try {
      await updateReceivable.mutateAsync({
        id: receivable.id,
        body: { status: "CANCELLED" },
      })
      appToast.success({ text1: "Cobro cancelado" })
      setOptionsOpen(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  async function onDeleteReceivable() {
    if (!receivable) {
      return
    }
    try {
      const receivableId = receivable.id
      await deleteReceivable.mutateAsync(receivableId)
      setConfirmOpen(false)
      setOptionsOpen(false)
      router.push(APP_ROUTES.app.financePlanning)
      showUndoToast("Cobro eliminado", () =>
        restoreReceivable.mutate(receivableId, {
          onError: (error) =>
            appToast.error({ text1: financeErrorMessage(error) }),
        })
      )
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  const headerActions = useMemo(
    () => (
      <>
        <Button
          variant="outline"
          size="icon"
          className="size-9 rounded-full"
          aria-label="Opciones del cobro"
          onClick={() => setOptionsOpen(true)}
        >
          <MoreVerticalIcon className="size-4.5" />
        </Button>
      </>
    ),
    [setOptionsOpen]
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
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="size-6" />
      </div>
    )
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
          <ErrorState
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
          variant: FINANCE_RECEIVABLE_STATUS_VARIANT[receivable.status],
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
                  ? ` · vence ${formatCalendarDate(receivable.dueDate, display.locale)}`
                  : ""
              }`
            : undefined
        }
      />

      <div className="mx-4 flex flex-col gap-3 rounded-3xl bg-background">
        {canRegisterPayment ? (
          <Button className="w-full" onClick={() => setOpenPaymentSheet(true)}>
            <PlusIcon />
            Registrar cobro
          </Button>
        ) : null}

        {paymentsQuery.isError ? (
          <ErrorState
            message={financeLoadErrorMessage(paymentsQuery.error)}
            onRetry={() => void paymentsQuery.refetch()}
            isRetrying={paymentsQuery.isFetching}
          />
        ) : null}

        <AsyncRegion
          pending={paymentsQuery.isPending}
          pendingFallback={
            <div className="flex flex-col gap-2 px-3 py-2" aria-hidden>
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          }
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
                    formatCalendarDate(payment.paidAt, display.locale),
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
          <InfiniteListSentinel
            hasNextPage={paymentsQuery.hasNextPage}
            isFetchingNextPage={paymentsQuery.isFetchingNextPage}
            onLoadMore={() => void paymentsQuery.fetchNextPage()}
          />
        </AsyncRegion>

        {payments.length > 0 ? (
          <p className="px-1 text-xs text-muted-foreground">
            Para deshacer un cobro, borra el movimiento que creó en Movimientos:
            el saldo se corrige solo.
          </p>
        ) : null}
      </div>

      <RecordOptionsSheet
        open={optionsOpen}
        onOpenChange={setOptionsOpen}
        description={receivable.debtorName}
        options={[
          {
            id: "edit",
            title: "Editar cobro",
            icon: PencilIcon,
            onPress: () => {
              setOptionsOpen(false)
              setOpenReceivableSheet(true)
            },
          },
          {
            id: "cancel",
            title: "Cancelar cobro",
            icon: ArchiveIcon,
            disabled:
              updateReceivable.isPending || receivable.status === "CANCELLED",
            onPress: () => void onCancelReceivable(),
          },
          {
            id: "write-off",
            title: "Castigar deuda",
            icon: HandCoinsIcon,
            disabled:
              writeOffReceivable.isPending ||
              receivable.status === "WRITTEN_OFF",
            onPress: () => void onWriteOff(),
          },
          {
            id: "delete",
            title: "Eliminar",
            icon: Trash2Icon,
            destructive: true,
            disabled: deleteReceivable.isPending,
            onPress: () => setConfirmOpen(true),
          },
        ]}
      />

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open && !deleteReceivable.isPending) {
            setConfirmOpen(false)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Trash2Icon aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>
              ¿Eliminar “{receivable.debtorName}”?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se borra su historial de cobros. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteReceivable.isPending}>
              <XIcon className="size-4 shrink-0" aria-hidden="true" />
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteReceivable.isPending}
              onClick={() => void onDeleteReceivable()}
            >
              {deleteReceivable.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Trash2Icon className="size-4 shrink-0" aria-hidden="true" />
              )}
              {deleteReceivable.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ReceivablePaymentSheet
        open={openPaymentSheet}
        onOpenChange={setOpenPaymentSheet}
        receivableId={receivable.id}
        debtorName={receivable.debtorName}
        currency={receivable.currency}
        display={money}
        outstanding={outstanding > 0 ? outstanding : undefined}
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
