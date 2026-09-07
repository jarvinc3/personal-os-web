"use client"

import { FinanceAccountsList } from "@/src/modules/finance/components/accounts/finance-accounts-list";
import { FinanceAuthenticatedPage } from "@/src/modules/finance/components/layout/finance-authenticated-page";
import { useFinanceEnabled } from "@/src/modules/finance/hooks/use-finance-enabled";

export function FinanceAccountsClient() {
  return (
    <FinanceAuthenticatedPage>
      <FinanceAccountsCatalog />
    </FinanceAuthenticatedPage>
  )
}

function FinanceAccountsCatalog() {
  const { isEnabled, config } = useFinanceEnabled()
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }

  return (
    <FinanceAccountsList
      enabled={isEnabled}
      display={display}
      defaultCurrency={config.baseCurrency}
    />
  )
}
