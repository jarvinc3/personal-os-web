"use client"

import { FinanceAuthenticatedPage } from "@/src/modules/finance/components/layout/finance-authenticated-page"
import { FinanceSyncList } from "@/src/modules/finance/components/sync/finance-sync"
import { useFinanceEnabled } from "@/src/modules/finance/hooks/use-finance-enabled"

export function FinanceSyncClient() {
  return (
    <FinanceAuthenticatedPage>
      <FinanceSyncCatalog />
    </FinanceAuthenticatedPage>
  )
}

function FinanceSyncCatalog() {
  const { isEnabled } = useFinanceEnabled()
  return <FinanceSyncList enabled={isEnabled} />
}
