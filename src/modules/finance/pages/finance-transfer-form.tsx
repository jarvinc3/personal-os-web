"use client"

import { TransferForm } from "@/src/modules/finance/components/transactions/transfer-form"
import { FinanceAuthenticatedPage } from "@/src/modules/finance/components/layout/finance-authenticated-page"
import { useFinanceEnabled } from "@/src/modules/finance/hooks/use-finance-enabled"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

export function FinanceTransferCreateClient() {
  return (
    <FinanceAuthenticatedPage>
      <FinanceTransferFormView />
    </FinanceAuthenticatedPage>
  )
}

function FinanceTransferFormView() {
  const router = useRouter()
  const { isEnabled, config } = useFinanceEnabled()

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
    [handleBack],
  )

  return (
    <TransferForm
      defaultCurrency={config.baseCurrency}
      enabled={isEnabled}
      display={{
        currency: config.baseCurrency,
        showCents: config.display.showCents,
        compactNumbers: config.display.compactNumbers,
      }}
      onDone={handleBack}
    />
  )
}
