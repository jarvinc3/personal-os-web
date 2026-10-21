"use client"

import { TransferForm } from "@/src/modules/finance/transactions/components/transfer-form"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { MissingRecord } from "@/src/modules/finance/shared/components/layout/missing-record"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useTransaction } from "@/src/modules/finance/shared/hooks/use-transactions"
import { financeLoadErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { isTransferTransaction } from "@/src/modules/finance/shared/lib/transactions-query"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { ArrowLeftRightIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

export function TransferCreateScreen() {
  return (
    <FinanceGate>
      <TransferCreateScreenBody />
    </FinanceGate>
  )
}

function TransferCreateScreenBody() {
  const router = useRouter()
  const { isEnabled, config, formatLocale } = useFinanceEnabled()

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push(APP_ROUTES.app.financeTransactions)
  }, [router])

  usePageHeader(
    {
      variant: "secondary",
      title: "Nueva transferencia",
      onBack: handleBack,
    },
    [handleBack]
  )

  return (
    <TransferForm
      defaultCurrency={config.baseCurrency}
      enabled={isEnabled}
      display={{
        currency: config.baseCurrency,
        showCents: config.display.showCents,
        compactNumbers: config.display.compactNumbers,
        locale: formatLocale,
      }}
      defaultAccountId={config.defaultAccountId}
      onDone={handleBack}
    />
  )
}

type TransferEditScreenProps = {
  transactionId: string
}

export function TransferEditScreen({ transactionId }: TransferEditScreenProps) {
  return (
    <FinanceGate>
      <TransferEditScreenBody transactionId={transactionId} />
    </FinanceGate>
  )
}

function TransferEditScreenBody({ transactionId }: TransferEditScreenProps) {
  const router = useRouter()
  const { isEnabled, config, formatLocale } = useFinanceEnabled()
  const detailQuery = useTransaction(isEnabled, transactionId)
  const transfer = detailQuery.data ?? null

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push(APP_ROUTES.app.financeTransaction(transactionId))
  }, [router, transactionId])

  usePageHeader(
    {
      variant: "secondary",
      title: "Editar transferencia",
      onBack: handleBack,
    },
    [handleBack]
  )

  if (detailQuery.isPending && !transfer) {
    return <LoadingView />
  }

  if (detailQuery.error) {
    return (
      <FinanceErrorState
        message={financeLoadErrorMessage(detailQuery.error)}
        onRetry={() => void detailQuery.refetch()}
        isRetrying={detailQuery.isFetching}
      />
    )
  }

  if (!transfer || !isTransferTransaction(transfer)) {
    return (
      <MissingRecord
        icon={ArrowLeftRightIcon}
        title="No encontramos esta transferencia"
        description="Puede que se haya eliminado."
        backHref={APP_ROUTES.app.financeTransactions}
        backLabel="Volver a Movimientos"
      />
    )
  }

  return (
    <TransferForm
      defaultCurrency={config.baseCurrency}
      enabled={isEnabled}
      display={{
        currency: config.baseCurrency,
        showCents: config.display.showCents,
        compactNumbers: config.display.compactNumbers,
        locale: formatLocale,
      }}
      transfer={transfer}
      defaultAccountId={config.defaultAccountId}
      onDone={handleBack}
    />
  )
}
