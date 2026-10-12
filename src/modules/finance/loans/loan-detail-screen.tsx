"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { MissingRecord } from "@/src/modules/finance/shared/components/layout/missing-record"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import { FinanceProgressHero } from "@/src/modules/finance/shared/components/layout/progress-hero"
import { LoanSurfaceMark } from "@/src/modules/finance/loans/components/loan-progress-card"
import { LoanSheet } from "@/src/modules/finance/loans/components/loan-sheet"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import { useLoanInstallments } from "@/src/modules/finance/shared/hooks/use-loan-installments"
import { useLoans } from "@/src/modules/finance/shared/hooks/use-loans"
import { financeLoadErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { formatRatePercentLabel } from "@/src/modules/finance/shared/lib/interest-rate"
import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import { loanProgressSummary } from "@/src/modules/finance/shared/lib/planning-lists"
import { FINANCE_INSTALLMENT_FREQ_LABEL } from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
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
import {
  HandCoinsIcon,
  MoreVerticalIcon,
  PencilIcon,
  PlusIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo } from "react"

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
  const accountsQuery = useAccounts(isEnabled)
  const installmentsQuery = useLoanInstallments(isEnabled, loanId)
  const { open: openLoanSheet, setOpen: setOpenLoanSheet } = useSheetParam(
    FINANCE_SHEET_KEYS.loan
  )
  const { open: openOptionsSheet, setOpen: setOpenOptionsSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.loanOptions)

  const loan =
    (loansQuery.data ?? []).find((item) => item.id === loanId) ?? null
  const institutions = institutionsQuery.data ?? []
  const accounts = accountsQuery.data ?? []
  const institution = loan?.institutionId
    ? (institutions.find((item) => item.id === loan.institutionId) ?? null)
    : null
  const installments = installmentsQuery.data ?? []
  const accent = institution?.color ?? ACCENT_FALLBACK_COLOR
  const money = { ...display, currency: loan?.currency ?? display.currency }
  const summary = loan ? loanProgressSummary(loan) : null
  const rateLabel = formatRatePercentLabel(loan?.interestRate ?? null)

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
                <Button onClick={() => setOpenLoanSheet(true)}>
                  <PlusIcon />
                  Préstamo
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

      <BottomSheet
        open={openOptionsSheet}
        onOpenChange={setOpenOptionsSheet}
        title="Opciones"
        description={loan.lenderName}
      >
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <SummaryItem
            title="Editar préstamo"
            icon={PencilIcon}
            onPress={() => {
              setOpenOptionsSheet(false)
              setOpenLoanSheet(true)
            }}
            isLast
            className="px-3"
          />
        </div>
      </BottomSheet>

      <LoanSheet
        open={openLoanSheet}
        onOpenChange={setOpenLoanSheet}
        loan={loan}
        accounts={accounts}
        institutions={institutions}
        defaultCurrency={config.baseCurrency}
        display={money}
      />
    </>
  )
}
