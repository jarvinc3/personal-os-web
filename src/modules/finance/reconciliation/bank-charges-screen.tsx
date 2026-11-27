"use client"

import { BankChargesView } from "@/src/modules/finance/reconciliation/components/bank-charges-view"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { todayDateInput } from "@/src/modules/finance/shared/lib/ledger-form"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { useBackTo } from "@/src/shared/hooks/use-back-to"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"

export function BankChargesScreen() {
  return (
    <FinanceGate>
      <BankChargesScreenBody />
    </FinanceGate>
  )
}

function BankChargesScreenBody() {
  const { isEnabled, config, formatLocale } = useFinanceEnabled()

  const handleBack = useBackTo(APP_ROUTES.app.financeProducts)

  usePageHeader(
    {
      variant: "secondary",
      title: "Cargos bancarios",
      onBack: handleBack,
    },
    [handleBack]
  )

  return (
    <BankChargesView
      enabled={isEnabled}
      display={{
        currency: config.baseCurrency,
        showCents: config.display.showCents,
        compactNumbers: config.display.compactNumbers,
        locale: formatLocale,
      }}
      today={todayDateInput()}
    />
  )
}
