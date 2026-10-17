"use client"

import { CreditCardIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { CardFormScreen } from "@/src/modules/finance/cards/components/card-form-screen"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { MissingRecord } from "@/src/modules/finance/shared/components/layout/missing-record"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useCards } from "@/src/modules/finance/shared/hooks/use-cards"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import { financeLoadErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"

export function CardCreateScreen() {
  return (
    <FinanceGate>
      <CardCreateScreenBody />
    </FinanceGate>
  )
}

function CardCreateScreenBody() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isEnabled, config } = useFinanceEnabled()
  const institutionsQuery = useInstitutions(isEnabled)
  const accountsQuery = useAccounts(isEnabled)

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push(APP_ROUTES.app.financeProducts)
  }, [router])

  usePageHeader(
    { variant: "secondary", title: "Nueva tarjeta", onBack: handleBack },
    [handleBack]
  )

  return (
    <CardFormScreen
      institutions={institutionsQuery.data ?? []}
      accounts={accountsQuery.data ?? []}
      defaultCurrency={config.baseCurrency}
      defaultInstitutionId={searchParams.get("institutionId") ?? undefined}
      display={{
        currency: config.baseCurrency,
        showCents: config.display.showCents,
        compactNumbers: config.display.compactNumbers,
      }}
      onDone={handleBack}
      onReadStatement={() => router.push(APP_ROUTES.app.financeSync)}
    />
  )
}

type CardEditScreenProps = {
  cardId: string
}

export function CardEditScreen({ cardId }: CardEditScreenProps) {
  return (
    <FinanceGate>
      <CardEditScreenBody cardId={cardId} />
    </FinanceGate>
  )
}

function CardEditScreenBody({ cardId }: CardEditScreenProps) {
  const router = useRouter()
  const { isEnabled, config } = useFinanceEnabled()
  const cardsQuery = useCards(isEnabled)
  const institutionsQuery = useInstitutions(isEnabled)
  const accountsQuery = useAccounts(isEnabled)
  const card =
    (cardsQuery.data ?? []).find((item) => item.id === cardId) ?? null

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push(APP_ROUTES.app.financeProducts)
  }, [router])

  usePageHeader(
    { variant: "secondary", title: "Editar tarjeta", onBack: handleBack },
    [handleBack]
  )

  if (cardsQuery.isPending && !card) {
    return <LoadingView />
  }

  if (cardsQuery.error) {
    return (
      <FinanceErrorState
        message={financeLoadErrorMessage(cardsQuery.error)}
        onRetry={() => void cardsQuery.refetch()}
        isRetrying={cardsQuery.isFetching}
      />
    )
  }

  if (!card) {
    return (
      <MissingRecord
        icon={CreditCardIcon}
        title="No encontramos esta tarjeta"
        description="Puede que se haya archivado o eliminado."
        backHref={APP_ROUTES.app.financeProducts}
        backLabel="Volver a Productos"
      />
    )
  }

  return (
    <CardFormScreen
      card={card}
      institutions={institutionsQuery.data ?? []}
      accounts={accountsQuery.data ?? []}
      defaultCurrency={config.baseCurrency}
      display={{
        currency: config.baseCurrency,
        showCents: config.display.showCents,
        compactNumbers: config.display.compactNumbers,
      }}
      onDone={handleBack}
      onReadStatement={() => router.push(APP_ROUTES.app.financeSync)}
      onUpdateBalance={() =>
        router.push(
          `${APP_ROUTES.app.financeInstitutionCard(card.institutionId, card.id)}?sheet=${FINANCE_SHEET_KEYS.cardBalance}`
        )
      }
    />
  )
}
