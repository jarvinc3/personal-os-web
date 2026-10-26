"use client"

import { Building2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { InstitutionFormScreen } from "@/src/modules/finance/institutions/components/institution-form-screen"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { MissingRecord } from "@/src/modules/finance/shared/components/layout/missing-record"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import { financeLoadErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"

export function InstitutionCreateScreen() {
  return (
    <FinanceGate>
      <InstitutionCreateScreenBody />
    </FinanceGate>
  )
}

function InstitutionCreateScreenBody() {
  const router = useRouter()

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push(APP_ROUTES.app.financeProducts)
  }, [router])

  usePageHeader(
    {
      variant: "secondary",
      title: "Nueva institución",
      onBack: handleBack,
    },
    [handleBack]
  )

  return (
    <InstitutionFormScreen
      onDone={handleBack}
      onAddProduct={(choice, institutionId) => {
        if (choice === "loan") {
          router.push(
            `${APP_ROUTES.app.financeLoanNew}?institutionId=${institutionId}`
          )
          return
        }
        if (choice === "card") {
          router.push(
            `${APP_ROUTES.app.financeCardNew}?institutionId=${institutionId}`
          )
          return
        }
        router.push(
          `${APP_ROUTES.app.financeInstitution(institutionId)}?sheet=${FINANCE_SHEET_KEYS.account}`
        )
      }}
    />
  )
}

type InstitutionEditScreenProps = {
  institutionId: string
}

export function InstitutionEditScreen({
  institutionId,
}: InstitutionEditScreenProps) {
  return (
    <FinanceGate>
      <InstitutionEditScreenBody institutionId={institutionId} />
    </FinanceGate>
  )
}

function InstitutionEditScreenBody({
  institutionId,
}: InstitutionEditScreenProps) {
  const router = useRouter()
  const { isEnabled } = useFinanceEnabled()
  const institutionsQuery = useInstitutions(isEnabled)
  const institution =
    (institutionsQuery.data ?? []).find((item) => item.id === institutionId) ??
    null

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push(APP_ROUTES.app.financeInstitution(institutionId))
  }, [router, institutionId])

  usePageHeader(
    {
      variant: "secondary",
      title: "Editar institución",
      onBack: handleBack,
    },
    [handleBack]
  )

  if (institutionsQuery.isPending && !institution) {
    return <LoadingView />
  }

  if (institutionsQuery.error) {
    return (
      <ErrorState
        message={financeLoadErrorMessage(institutionsQuery.error)}
        onRetry={() => void institutionsQuery.refetch()}
        isRetrying={institutionsQuery.isFetching}
      />
    )
  }

  if (!institution) {
    return (
      <MissingRecord
        icon={Building2Icon}
        title="No encontramos esta institución"
        description="Puede que se haya archivado o eliminado."
        backHref={APP_ROUTES.app.financeProducts}
        backLabel="Volver a Productos"
      />
    )
  }

  return <InstitutionFormScreen institution={institution} onDone={handleBack} />
}
