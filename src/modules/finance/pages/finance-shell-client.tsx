"use client"

import { FinanceOverview } from "@/src/modules/finance/components/dashboard/finance-overview"
import { FinanceAuthenticatedPage } from "@/src/modules/finance/components/layout/finance-authenticated-page"

export function FinanceShellClient() {
  return (
    <FinanceAuthenticatedPage>
      <FinanceOverview />
    </FinanceAuthenticatedPage>
  )
}
