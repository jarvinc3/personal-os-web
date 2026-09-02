import { Suspense } from "react"

import { FinanceBudgetsClient } from "@/src/modules/finance/pages/finance-budgets"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

export default function FinanceBudgetsPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <FinanceBudgetsClient />
    </Suspense>
  )
}
