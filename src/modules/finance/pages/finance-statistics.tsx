"use client"

import { FinanceStatistics } from "@/src/modules/finance/components/dashboard/finance-statistics";
import { FinanceAuthenticatedPage } from "@/src/modules/finance/components/layout/finance-authenticated-page";

export function FinanceStatisticsClient() {
  return (
    <FinanceAuthenticatedPage>
      <FinanceStatistics />
    </FinanceAuthenticatedPage>
  )
}
