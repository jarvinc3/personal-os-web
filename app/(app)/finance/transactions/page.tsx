import { Suspense } from "react"

import { TransactionsScreen } from "@/src/modules/finance/transactions/transactions-screen"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

export default function FinanceTransactionsPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <TransactionsScreen />
    </Suspense>
  )
}
