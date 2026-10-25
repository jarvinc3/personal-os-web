"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { GlossaryHelpButton } from "@/src/modules/help"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { MissingRecord } from "@/src/modules/finance/shared/components/layout/missing-record"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import { FinanceProgressHero } from "@/src/modules/finance/shared/components/layout/progress-hero"
import { LoanSurfaceMark } from "@/src/modules/finance/loans/components/loan-progress-card"
import { LoanAmortizationSheet } from "@/src/modules/finance/loans/components/amortization-sheet"
import { LoanPrepaymentSheet } from "@/src/modules/finance/loans/components/loan-prepayment-sheet"
import { LoanPaymentSheet } from "@/src/modules/finance/loans/components/loan-payment-sheet"
import { InstallmentDetailSheet } from "@/src/modules/finance/loans/components/installment-detail-sheet"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import { AccountProductRow } from "@/src/modules/finance/shared/components/product-rows"
import {
  useLoanInstallments,
  useLoanSchedule,
} from "@/src/modules/finance/shared/hooks/use-loan-installments"
import {
  useArchiveLoan,
  useDeleteLoan,
  useRestoreLoan,
  useUnarchiveLoan,
  useLoans,
} from "@/src/modules/finance/shared/hooks/use-loans"
import {
  financeErrorMessage,
  financeLoadErrorMessage,
} from "@/src/modules/finance/shared/lib/finance-error"
import { showUndoToast } from "@/src/modules/finance/shared/components/undo-toast"
import { formatRatePercentLabel } from "@/src/modules/finance/shared/lib/interest-rate"
import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import { nextUnpaidInstallment } from "@/src/modules/finance/shared/lib/loan-payment"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import { loanProgressSummary } from "@/src/modules/finance/shared/lib/planning-lists"
import {
  FINANCE_INSTALLMENT_FREQ_LABEL,
  FINANCE_LOAN_INSTALLMENT_STATUS_LABEL,
  type FinanceLoanInstallment,
} from "@/src/modules/finance/shared/types/entities"
import { DeleteRecordDialog } from "@/src/modules/finance/shared/components/delete-record-dialog"
import { ArchiveRecordDialog } from "@/src/modules/finance/shared/components/archive-record-dialog"
import { RecordOptionsSheet } from "@/src/modules/finance/shared/components/record-options-sheet"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
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
import {
  SummaryItem,
  SummarySection,
} from "@/src/shared/components/data-display/summary"
import { InfiniteListSentinel } from "@/src/shared/components/feedback/infinite-list-sentinel"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { appToast } from "@/src/shared/lib/app-toast"
import {
  ArchiveIcon,
  HandCoinsIcon,
  LandmarkIcon,
  MoreVerticalIcon,
  PencilIcon,
  TableIcon,
  Trash2Icon,
  WalletIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

import { ACCENT_FALLBACK_COLOR } from "@/src/shared/lib/accent-gradient"

const INSTALLMENT_STATUS_VARIANT: Record<
  FinanceLoanInstallment["status"],
  "success" | "warning" | "destructive"
> = {
  PENDING: "warning",
  PARTIAL: "warning",
  PAID: "success",
  OVERDUE: "destructive",
}

type LoanDetailScreenProps = {
  loanId: string
}

export function LoanDetailScreen({ loanId }: LoanDetailScreenProps) {
  return (
    <FinanceGate>
      <LoanDetailScreenBody loanId={loanId} />
    </FinanceGate>
  )
}

function LoanDetailScreenBody({ loanId }: LoanDetailScreenProps) {
  const router = useRouter()
  const { isEnabled, config, formatLocale } = useFinanceEnabled()
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
    locale: formatLocale,
  }

  const loansQuery = useLoans(isEnabled)
  const institutionsQuery = useInstitutions(isEnabled)
  const accountsQuery = useAccounts(isEnabled)
  const installmentsQuery = useLoanInstallments(isEnabled, loanId)
  const archiveLoan = useArchiveLoan()
  const deleteLoan = useDeleteLoan()
  const restoreLoan = useRestoreLoan()
  const unarchiveLoan = useUnarchiveLoan()
  const { open: openOptionsSheet, setOpen: setOpenOptionsSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.loanOptions)
  const { open: openPrepaymentSheet, setOpen: setOpenPrepaymentSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.loanPrepayment)
  const { open: openPaymentSheet, setOpen: setOpenPaymentSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.loanPayment)

  const loan =
    (loansQuery.data ?? []).find((item) => item.id === loanId) ?? null
  const loanTitle = loan?.name?.trim() || loan?.lenderName || "Préstamo"
  const institutions = institutionsQuery.data ?? []
  const institution = loan?.institutionId
    ? (institutions.find((item) => item.id === loan.institutionId) ?? null)
    : null
  const accounts = accountsQuery.data ?? []
  const paymentAccount = loan?.accountId
    ? (accounts.find((item) => item.id === loan.accountId) ?? null)
    : null
  const disbursementAccount = loan?.disbursementAccountId
    ? (accounts.find((item) => item.id === loan.disbursementAccountId) ?? null)
    : null
  const installments = infiniteListItems(installmentsQuery.data)
  const nextInstallment = nextUnpaidInstallment(installments)
  const accent = institution?.color ?? ACCENT_FALLBACK_COLOR
  const money = { ...display, currency: loan?.currency ?? display.currency }
  const summary = loan ? loanProgressSummary(loan) : null
  const rateLabel = formatRatePercentLabel(loan?.interestRate ?? null)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false)
  const [amortizationOpen, setAmortizationOpen] = useState(false)
  const [selectedInstallment, setSelectedInstallment] =
    useState<FinanceLoanInstallment | null>(null)
  const scheduleQuery = useLoanSchedule(amortizationOpen, loanId)

  async function onArchiveLoan() {
    if (!loan) {
      return
    }
    try {
      const loanId = loan.id
      await archiveLoan.mutateAsync(loanId)
      setOpenOptionsSheet(false)
      router.push(APP_ROUTES.app.financePlanning)
      showUndoToast("Préstamo archivado", () =>
        unarchiveLoan.mutate(loanId, {
          onError: (error) =>
            appToast.error({ text1: financeErrorMessage(error) }),
        })
      )
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  async function onDeleteLoan() {
    if (!loan) {
      return
    }
    try {
      const loanId = loan.id
      await deleteLoan.mutateAsync(loanId)
      setConfirmOpen(false)
      setOpenOptionsSheet(false)
      router.push(APP_ROUTES.app.financePlanning)
      showUndoToast("Préstamo eliminado", () =>
        restoreLoan.mutate(loanId, {
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
          aria-label="Opciones del préstamo"
          onClick={() => setOpenOptionsSheet(true)}
        >
          <MoreVerticalIcon className="size-4.5" />
        </Button>
      </>
    ),
    [setOpenOptionsSheet]
  )

  usePageHeader(
    {
      variant: "secondary",
      title: loanTitle,
      onBack: () => router.back(),
      actions: headerActions,
      accentColor: accent,
    },
    [router, loan?.id, loanTitle, accent, headerActions]
  )

  if (loansQuery.isPending && !loan) {
    return <LoadingView />
  }

  if (!loan) {
    return (
      <MissingRecord
        icon={HandCoinsIcon}
        title="No encontramos este préstamo"
        description="Puede que se haya archivado o borrado."
        backHref={APP_ROUTES.app.financePlanning}
        backLabel="Volver a Planificación"
      />
    )
  }

  const paidOff = summary?.paidOff ?? false
  const progress = summary?.progress ?? 0

  return (
    <>
      {loansQuery.error ? (
        <div className="mb-3">
          <FinanceErrorState
            message={financeLoadErrorMessage(loansQuery.error)}
            onRetry={() => void loansQuery.refetch()}
            isRetrying={loansQuery.isFetching}
          />
        </div>
      ) : null}

      <FinanceProgressHero
        accent={accent}
        media={
          <BrandLogo
            name={institution?.name ?? loan.lenderName}
            logoUrl={institution?.logoUrl}
            size={48}
          />
        }
        title={loanTitle}
        badge={{
          label: paidOff ? "Saldado" : "Activo",
          variant: paidOff ? "success" : "warning",
        }}
        subtitle={[
          FINANCE_INSTALLMENT_FREQ_LABEL[loan.installmentFreq],
          rateLabel,
          institution?.name,
        ]
          .filter(Boolean)
          .join(" · ")}
        metricLabel={
          <span className="flex items-center gap-1">
            Deuda
            <GlossaryHelpButton
              slug="deuda"
              className="text-white/70 hover:text-white"
            />
          </span>
        }
        metricValue={formatFinanceMoney(loan.currentBalance, money)}
        progress={progress}
        startCaption={`${loan.paidInstallments}/${loan.totalInstallments} cuotas`}
        endCaption={`Original ${formatFinanceMoney(loan.originalAmount, money)}`}
        footnote={
          loan.nextDueDate
            ? `Próximo pago · ${formatCalendarDate(loan.nextDueDate, display.locale)}`
            : undefined
        }
        decoration={<LoanSurfaceMark size="header" />}
      />

      <div className="mx-4 mt-3">
        <SummarySection title="Préstamo" icon={LandmarkIcon}>
          <SummaryItem
            title="Prestamista"
            icon={LandmarkIcon}
            value={institution?.name ?? loan.lenderName}
            isLast={false}
          />
          {paymentAccount ? (
            <AccountProductRow
              account={paymentAccount}
              display={display}
              variant="compact"
            />
          ) : (
            <SummaryItem
              title="Se paga desde"
              icon={WalletIcon}
              value={loan.account?.name ?? "Sin cuenta de pago"}
              isLast={false}
            />
          )}
          {disbursementAccount ? (
            <AccountProductRow
              account={disbursementAccount}
              display={display}
              variant="compact"
            />
          ) : (
            <SummaryItem
              title="Desembolso"
              icon={HandCoinsIcon}
              value={loan.disbursementAccount?.name ?? "Sin cuenta"}
              description={
                loan.disbursementAccount
                  ? undefined
                  : "El dinero no entró a ninguna cuenta, así que la deuda resta del patrimonio sin un saldo que la compense."
              }
              isLast
            />
          )}
        </SummarySection>
      </div>

      <div className="mx-4 flex flex-col gap-3 rounded-3xl bg-background">
        {nextInstallment ? (
          <Button
            type="button"
            className="w-full"
            onClick={() => setOpenPaymentSheet(true)}
          >
            <HandCoinsIcon className="size-4 shrink-0" />
            Pagar cuota
          </Button>
        ) : null}
        {installmentsQuery.isError ? (
          <FinanceErrorState
            message={financeLoadErrorMessage(installmentsQuery.error)}
            onRetry={() => void installmentsQuery.refetch()}
            isRetrying={installmentsQuery.isFetching}
          />
        ) : null}

        <AsyncRegion
          pending={installmentsQuery.isPending}
          pendingFallback={<FinanceListSkeleton rows={5} />}
          empty={!installmentsQuery.isError && installments.length === 0}
          emptyFallback={
            <Empty className="py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HandCoinsIcon />
                </EmptyMedia>
                <EmptyTitle>Sin cuotas</EmptyTitle>
                <EmptyDescription>
                  Define la cuota y el plazo para seguir los pagos.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  onClick={() =>
                    router.push(APP_ROUTES.app.financeLoanEdit(loan.id))
                  }
                >
                  <PencilIcon />
                  Editar préstamo
                </Button>
              </EmptyContent>
            </Empty>
          }
        >
          {installments.length > 0 ? (
            <div className="rounded-2xl border border-border bg-card">
              {installments.map((installment, index) => (
                <SummaryItem
                  key={installment.id}
                  title={`Cuota ${installment.installmentNo}`}
                  description={`Vence ${formatCalendarDate(installment.dueDate, display.locale)} · Capital ${formatFinanceMoney(installment.principal, money)} · Interés ${formatFinanceMoney(installment.interest, money)}`}
                  wrapDescription
                  value={formatFinanceMoney(installment.amount, money)}
                  onPress={() => setSelectedInstallment(installment)}
                  trailing={
                    <Badge
                      variant={INSTALLMENT_STATUS_VARIANT[installment.status]}
                    >
                      {
                        FINANCE_LOAN_INSTALLMENT_STATUS_LABEL[
                          installment.status
                        ]
                      }
                    </Badge>
                  }
                  isLast={index === installments.length - 1}
                />
              ))}
            </div>
          ) : null}
          <InfiniteListSentinel
            hasNextPage={installmentsQuery.hasNextPage}
            isFetchingNextPage={installmentsQuery.isFetchingNextPage}
            onLoadMore={() => void installmentsQuery.fetchNextPage()}
          />
        </AsyncRegion>

        {installments.length > 0 ? (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setAmortizationOpen(true)}
          >
            <TableIcon className="size-4 shrink-0" />
            Ver plan de amortización
          </Button>
        ) : null}
      </div>

      <RecordOptionsSheet
        open={openOptionsSheet}
        onOpenChange={setOpenOptionsSheet}
        description={loanTitle}
        options={[
          {
            id: "prepay",
            title: "Abonar a capital",
            icon: HandCoinsIcon,
            onPress: () => setOpenPrepaymentSheet(true),
          },
          {
            id: "edit",
            title: "Editar préstamo",
            icon: PencilIcon,
            onPress: () => router.push(APP_ROUTES.app.financeLoanEdit(loan.id)),
          },
          {
            id: "archive",
            title: "Archivar",
            icon: ArchiveIcon,
            disabled: archiveLoan.isPending || deleteLoan.isPending,
            onPress: () => setArchiveConfirmOpen(true),
          },
          {
            id: "delete",
            title: "Eliminar",
            icon: Trash2Icon,
            destructive: true,
            disabled: archiveLoan.isPending || deleteLoan.isPending,
            onPress: () => setConfirmOpen(true),
          },
        ]}
      />

      <InstallmentDetailSheet
        open={selectedInstallment !== null}
        onOpenChange={(next) => {
          if (!next) {
            setSelectedInstallment(null)
          }
        }}
        installment={selectedInstallment}
        display={money}
        canPay={
          selectedInstallment !== null &&
          nextInstallment !== null &&
          selectedInstallment.id === nextInstallment.id
        }
        onPay={() => {
          setSelectedInstallment(null)
          setOpenPaymentSheet(true)
        }}
      />

      <LoanPaymentSheet
        open={openPaymentSheet}
        onOpenChange={setOpenPaymentSheet}
        loanId={loan.id}
        lenderName={loan.lenderName}
        currency={loan.currency}
        loanAccountId={loan.accountId}
        installment={nextInstallment}
      />

      <LoanAmortizationSheet
        open={amortizationOpen}
        onOpenChange={setAmortizationOpen}
        installments={scheduleQuery.data ?? installments}
        currentBalance={loan.currentBalance}
        display={money}
      />

      <LoanPrepaymentSheet
        open={openPrepaymentSheet}
        onOpenChange={setOpenPrepaymentSheet}
        loanId={loan.id}
        lenderName={loan.lenderName}
        currency={loan.currency}
        penaltyPct={loan.prepaymentPenaltyPct}
        loanAccountId={loan.accountId}
        currentInstallments={loan.totalInstallments}
      />

      <DeleteRecordDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        recordName={loanTitle}
        pending={deleteLoan.isPending}
        consequences="Se borran sus cuotas y su calendario de pagos. No se puede deshacer."
        onConfirm={() => void onDeleteLoan()}
        archive={{
          label: "¿Solo ocultarlo? Archivar",
          pending: archiveLoan.isPending,
          onArchive: () => void onArchiveLoan(),
        }}
      />

      <ArchiveRecordDialog
        open={archiveConfirmOpen}
        onOpenChange={setArchiveConfirmOpen}
        recordName={loanTitle}
        pending={archiveLoan.isPending}
        onConfirm={() => void onArchiveLoan()}
      />
    </>
  )
}
