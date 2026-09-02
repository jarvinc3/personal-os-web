"use client"

import { FinanceAuthenticatedPage } from "@/src/modules/finance/components/layout/finance-authenticated-page"
import { FinanceTransactionsList } from "@/src/modules/finance/components/transactions/finance-transactions-list"
import { useFinanceEnabled } from "@/src/modules/finance/hooks/use-finance-enabled"

export function FinanceTransactionsClient() {
  return (
    <FinanceAuthenticatedPage>
      <FinanceTransactionsCatalog />
    </FinanceAuthenticatedPage>
  )
}

function FinanceTransactionsCatalog() {
  const { isEnabled, config } = useFinanceEnabled()
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }

  return <FinanceTransactionsList enabled={isEnabled} display={display} />
}
