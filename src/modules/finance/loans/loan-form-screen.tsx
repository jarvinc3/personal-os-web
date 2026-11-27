"use client"

import { HandCoinsIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"

import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { LoanEditForm } from "@/src/modules/finance/loans/components/loan-edit-form"
import { LoanWizard } from "@/src/modules/finance/loans/components/loan-wizard"
import { loanWizardPrefill } from "@/src/modules/finance/loans/lib/loan-form"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { MissingRecord } from "@/src/modules/finance/shared/components/layout/missing-record"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import { useLoans } from "@/src/modules/finance/shared/hooks/use-loans"
import { financeLoadErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { useBackTo } from "@/src/shared/hooks/use-back-to"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { Spinner } from "@/src/shared/components/ui/spinner"

export function LoanCreateScreen() {
  return (
    <FinanceGate>
      <LoanCreateScreenBody />
    </FinanceGate>
  )
}

function LoanCreateScreenBody() {
  const searchParams = useSearchParams()
  const { config, formatLocale } = useFinanceEnabled()
  const defaultInstitutionId = searchParams.get("institutionId") ?? CATALOG_NONE
  const prefill = loanWizardPrefill(searchParams)

  const handleBack = useBackTo(APP_ROUTES.app.financePlanning)

  usePageHeader(
    {
      variant: "secondary",
      title: "Nuevo préstamo",
      onBack: handleBack,
    },
    [handleBack]
  )

  return (
    <LoanWizard
      defaultCurrency={config.baseCurrency}
      defaultInstitutionId={defaultInstitutionId}
      prefill={prefill}
      display={{
        currency: config.baseCurrency,
        showCents: config.display.showCents,
        compactNumbers: config.display.compactNumbers,
        locale: formatLocale,
      }}
      onDone={handleBack}
    />
  )
}

type LoanEditScreenProps = {
  loanId: string
}

export function LoanEditScreen({ loanId }: LoanEditScreenProps) {
  return (
    <FinanceGate>
      <LoanEditScreenBody loanId={loanId} />
    </FinanceGate>
  )
}

function LoanEditScreenBody({ loanId }: LoanEditScreenProps) {
  const { isEnabled, config, formatLocale } = useFinanceEnabled()
  const loansQuery = useLoans(isEnabled)
  const institutionsQuery = useInstitutions(isEnabled)
  const accountsQuery = useAccounts(isEnabled)
  const loan =
    (loansQuery.data ?? []).find((item) => item.id === loanId) ?? null

  const handleBack = useBackTo(APP_ROUTES.app.financeLoan(loanId))

  usePageHeader(
    {
      variant: "secondary",
      title: "Editar préstamo",
      onBack: handleBack,
    },
    [handleBack]
  )

  if (loansQuery.isPending && !loan) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (loansQuery.error) {
    return (
      <ErrorState
        message={financeLoadErrorMessage(loansQuery.error)}
        onRetry={() => void loansQuery.refetch()}
        isRetrying={loansQuery.isFetching}
      />
    )
  }

  if (!loan) {
    return (
      <MissingRecord
        icon={HandCoinsIcon}
        title="No encontramos este préstamo"
        description="Puede que se haya archivado o eliminado."
        backHref={APP_ROUTES.app.financePlanning}
        backLabel="Volver a Planificación"
      />
    )
  }

  return (
    <LoanEditForm
      loan={loan}
      accounts={accountsQuery.data ?? []}
      institutions={institutionsQuery.data ?? []}
      defaultCurrency={config.baseCurrency}
      display={{
        currency: loan.currency || config.baseCurrency,
        showCents: config.display.showCents,
        compactNumbers: config.display.compactNumbers,
        locale: formatLocale,
      }}
      onDone={handleBack}
    />
  )
}
