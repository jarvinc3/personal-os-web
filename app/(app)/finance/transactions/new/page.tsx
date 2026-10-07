import { Suspense } from "react"

import { FinanceTransactionCreateClient } from "@/src/modules/finance/pages/finance-transaction-form"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

export default function FinanceTransactionNewPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <FinanceTransactionCreateClient />
    </Suspense>
  )
}
