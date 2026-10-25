"use client"

import { HandCoinsIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { LoanEditForm } from "@/src/modules/finance/loans/components/loan-edit-form"
import { LoanWizard } from "@/src/modules/finance/loans/components/loan-wizard"
import { loanWizardPrefill } from "@/src/modules/finance/loans/lib/loan-form"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { MissingRecord } from "@/src/modules/finance/shared/components/layout/missing-record"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import { useLoans } from "@/src/modules/finance/shared/hooks/use-loans"
import { financeLoadErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"

export function LoanCreateScreen() {
  return (
    <FinanceGate>
      <LoanCreateScreenBody />
    </FinanceGate>
  )
}

function LoanCreateScreenBody() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { config, formatLocale } = useFinanceEnabled()
  const defaultInstitutionId = searchParams.get("institutionId") ?? CATALOG_NONE
  const prefill = loanWizardPrefill(searchParams)

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push(APP_ROUTES.app.financePlanning)
  }, [router])

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
  const router = useRouter()
  const { isEnabled, config, formatLocale } = useFinanceEnabled()
  const loansQuery = useLoans(isEnabled)
  const institutionsQuery = useInstitutions(isEnabled)
  const accountsQuery = useAccounts(isEnabled)
  const loan =
    (loansQuery.data ?? []).find((item) => item.id === loanId) ?? null

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push(APP_ROUTES.app.financeLoan(loanId))
  }, [router, loanId])

  usePageHeader(
    {
      variant: "secondary",
      title: "Editar préstamo",
      onBack: handleBack,
    },
    [handleBack]
  )

  if (loansQuery.isPending && !loan) {
    return <LoadingView />
  }

  if (loansQuery.error) {
    return (
      <FinanceErrorState
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
