"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { MissingRecord } from "@/src/modules/finance/shared/components/layout/missing-record"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import { FinanceProgressHero } from "@/src/modules/finance/shared/components/layout/progress-hero"
import { LoanSurfaceMark } from "@/src/modules/finance/loans/components/loan-progress-card"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import { useLoanInstallments } from "@/src/modules/finance/shared/hooks/use-loan-installments"
import {
  useArchiveLoan,
  useDeleteLoan,
  useRestoreLoan,
  useLoans,
} from "@/src/modules/finance/shared/hooks/use-loans"
import {
  financeErrorMessage,
  financeLoadErrorMessage,
} from "@/src/modules/finance/shared/lib/finance-error"
import { showUndoToast } from "@/src/modules/finance/shared/components/undo-toast"
import { formatRatePercentLabel } from "@/src/modules/finance/shared/lib/interest-rate"
import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import { loanProgressSummary } from "@/src/modules/finance/shared/lib/planning-lists"
import { FINANCE_INSTALLMENT_FREQ_LABEL } from "@/src/modules/finance/shared/types/entities"
import { DeleteRecordDialog } from "@/src/modules/finance/shared/components/delete-record-dialog"
import { RecordOptionsSheet } from "@/src/modules/finance/shared/components/record-options-sheet"
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
import { appToast } from "@/src/shared/lib/app-toast"
import {
  ArchiveIcon,
  HandCoinsIcon,
  MoreVerticalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

import { ACCENT_FALLBACK_COLOR } from "@/src/shared/lib/accent-gradient"

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
  const { isEnabled, config } = useFinanceEnabled()
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }

  const loansQuery = useLoans(isEnabled)
  const institutionsQuery = useInstitutions(isEnabled)
  const installmentsQuery = useLoanInstallments(isEnabled, loanId)
  const archiveLoan = useArchiveLoan()
  const deleteLoan = useDeleteLoan()
  const restoreLoan = useRestoreLoan()
  const { open: openOptionsSheet, setOpen: setOpenOptionsSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.loanOptions)

  const loan =
    (loansQuery.data ?? []).find((item) => item.id === loanId) ?? null
  const institutions = institutionsQuery.data ?? []
  const institution = loan?.institutionId
    ? (institutions.find((item) => item.id === loan.institutionId) ?? null)
    : null
  const installments = installmentsQuery.data ?? []
  const accent = institution?.color ?? ACCENT_FALLBACK_COLOR
  const money = { ...display, currency: loan?.currency ?? display.currency }
  const summary = loan ? loanProgressSummary(loan) : null
  const rateLabel = formatRatePercentLabel(loan?.interestRate ?? null)

  const [confirmOpen, setConfirmOpen] = useState(false)

  async function onArchiveLoan() {
    if (!loan) {
      return
    }
    try {
      await archiveLoan.mutateAsync(loan.id)
      appToast.success({ text1: "Préstamo archivado" })
      setOpenOptionsSheet(false)
      router.push(APP_ROUTES.app.financePlanning)
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
      <Button
        variant="outline"
        size="icon"
        className="size-9 rounded-full"
        aria-label="Opciones del préstamo"
        onClick={() => setOpenOptionsSheet(true)}
      >
        <MoreVerticalIcon className="size-4.5" />
      </Button>
    ),
    [setOpenOptionsSheet]
  )

  usePageHeader(
    {
      variant: "secondary",
      title: institution?.name || loan?.lenderName || "Préstamo",
      onBack: () => router.back(),
      actions: headerActions,
      accentColor: accent,
    },
    [
      router,
      loan?.id,
      loan?.lenderName,
      institution?.name,
      accent,
      headerActions,
    ]
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
        title={loan.lenderName}
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
        metricLabel="Saldo"
        metricValue={formatFinanceMoney(loan.currentBalance, money)}
        progress={progress}
        startCaption={`${loan.paidInstallments}/${loan.totalInstallments} cuotas`}
        endCaption={`Original ${formatFinanceMoney(loan.originalAmount, money)}`}
        footnote={
          loan.nextDueDate
            ? `Próximo pago · ${formatCalendarDate(loan.nextDueDate)}`
            : undefined
        }
        decoration={<LoanSurfaceMark size="header" />}
      />

      <div className="mx-4 flex flex-col gap-3 rounded-3xl bg-background">
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
                  description={`Vence ${formatCalendarDate(installment.dueDate)}`}
                  value={formatFinanceMoney(installment.amount, money)}
                  trailing={
                    <Badge variant={installment.paidAt ? "success" : "warning"}>
                      {installment.paidAt ? "Pagada" : "Pendiente"}
                    </Badge>
                  }
                  isLast={index === installments.length - 1}
                />
              ))}
            </div>
          ) : null}
        </AsyncRegion>
      </div>

      <RecordOptionsSheet
        open={openOptionsSheet}
        onOpenChange={setOpenOptionsSheet}
        description={loan.lenderName}
        options={[
          {
            id: "edit",
            title: "Editar préstamo",
            icon: PencilIcon,
            onPress: () => {
              setOpenOptionsSheet(false)
              router.push(APP_ROUTES.app.financeLoanEdit(loan.id))
            },
          },
          {
            id: "archive",
            title: "Archivar",
            icon: ArchiveIcon,
            disabled: archiveLoan.isPending || deleteLoan.isPending,
            onPress: () => void onArchiveLoan(),
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

      <DeleteRecordDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        recordName={loan.lenderName}
        pending={deleteLoan.isPending}
        consequences="Se borran sus cuotas y su calendario de pagos. No se puede deshacer."
        onConfirm={() => void onDeleteLoan()}
        archive={{
          label: "¿Solo ocultarlo? Archivar",
          pending: archiveLoan.isPending,
          onArchive: () => void onArchiveLoan(),
        }}
      />
    </>
  )
}
