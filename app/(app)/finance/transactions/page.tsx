import { Suspense } from "react"

import { FinanceTransactionsClient } from "@/src/modules/finance/pages/finance-transactions"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

export default function FinanceTransactionsPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <FinanceTransactionsClient />
    </Suspense>
  )
}
