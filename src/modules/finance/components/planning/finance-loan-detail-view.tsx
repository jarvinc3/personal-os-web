"use client"

import { BrandLogo } from "@/src/modules/finance/components/brand-logo"
import { FinanceAuthenticatedPage } from "@/src/modules/finance/components/layout/finance-authenticated-page"
import { FinanceErrorState } from "@/src/modules/finance/components/layout/finance-error-state"
import { FinanceListSkeleton } from "@/src/modules/finance/components/layout/finance-list-skeleton"
import { LoanSheet } from "@/src/modules/finance/components/planning/loan-sheet"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/constants/sheet-keys"
import { useAccounts } from "@/src/modules/finance/hooks/use-accounts"
import { useFinanceEnabled } from "@/src/modules/finance/hooks/use-finance-enabled"
import { useInstitutions } from "@/src/modules/finance/hooks/use-institutions"
import { useLoanInstallments } from "@/src/modules/finance/hooks/use-loan-installments"
import { useLoans } from "@/src/modules/finance/hooks/use-loans"
import { financeLoadErrorMessage } from "@/src/modules/finance/lib/finance-error"
import { formatRatePercentLabel } from "@/src/modules/finance/lib/interest-rate"
import { formatCalendarDate } from "@/src/modules/finance/lib/ledger-form"
import { formatFinanceMoney } from "@/src/modules/finance/lib/money"
import { loanProgressSummary } from "@/src/modules/finance/lib/planning-lists"
import { FINANCE_INSTALLMENT_FREQ_LABEL } from "@/src/modules/finance/types/entities"
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

const FALLBACK_COLOR = "#1B4332"

type FinanceLoanDetailClientProps = {
  loanId: string
}

export function FinanceLoanDetailClient({
  loanId,
}: FinanceLoanDetailClientProps) {
  return (
    <FinanceAuthenticatedPage>
      <FinanceLoanDetailView loanId={loanId} />
    </FinanceAuthenticatedPage>
  )
}

function FinanceLoanDetailView({ loanId }: FinanceLoanDetailClientProps) {
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
  const accent = institution?.color ?? FALLBACK_COLOR
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
      title: loan?.lenderName ?? "Préstamo",
      onBack: () => router.back(),
      actions: headerActions,
      accentColor: accent,
    },
    [router, loan?.id, loan?.lenderName, accent, headerActions]
  )

  if (loansQuery.isPending && !loan) {
    return <LoadingView />
  }

  if (!loan) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HandCoinsIcon />
          </EmptyMedia>
          <EmptyTitle>No encontramos este préstamo</EmptyTitle>
          <EmptyDescription>
            Puede que se haya archivado o borrado.
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

      <div className="-mx-4 -mt-4 overflow-hidden md:-mx-6">
        <div
          className="rounded-b-3xl p-4 text-white md:p-6"
          style={{ background: accent }}
        >
          <div className="flex items-start gap-3">
            <BrandLogo
              name={institution?.name ?? loan.lenderName}
              logoUrl={institution?.logoUrl}
              size={48}
            />
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <h1 className="truncate text-2xl font-bold tracking-tight">
                  {loan.lenderName}
                </h1>
                <Badge
                  variant={paidOff ? "success" : "warning"}
                  className="shrink-0"
                >
                  {paidOff ? "Saldado" : "Activo"}
                </Badge>
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-white/70">
                <span>
                  {FINANCE_INSTALLMENT_FREQ_LABEL[loan.installmentFreq]}
                </span>
                <span>{rateLabel}</span>
                {institution ? <span>{institution.name}</span> : null}
              </p>
            </div>
          </div>

          <p className="mt-8 text-[11px] tracking-wide text-white/60 uppercase">
            Saldo
          </p>
          <p className="text-3xl font-bold tracking-tight tabular-nums">
            {formatFinanceMoney(loan.currentBalance, money)}
          </p>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex flex-wrap justify-between gap-x-3 text-xs text-white/70">
            <span>
              {loan.paidInstallments}/{loan.totalInstallments} cuotas
            </span>
            <span>
              Original {formatFinanceMoney(loan.originalAmount, money)}
            </span>
          </div>
          {loan.nextDueDate ? (
            <p className="mt-3 text-sm text-white/80">
              Próximo pago · {formatCalendarDate(loan.nextDueDate)}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mx-4 flex flex-col gap-3 rounded-3xl bg-background">
        {installmentsQuery.isError ? (
          <FinanceErrorState
            message={financeLoadErrorMessage(installmentsQuery.error)}
            onRetry={() => void installmentsQuery.refetch()}
            isRetrying={installmentsQuery.isFetching}
          />
        ) : null}

        {installmentsQuery.isPending ? <FinanceListSkeleton rows={5} /> : null}

        {!installmentsQuery.isPending && installments.length === 0 ? (
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
        ) : null}

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
      />
    </>
  )
}
