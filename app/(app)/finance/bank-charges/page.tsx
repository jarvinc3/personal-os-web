import { Suspense } from "react"

import { BankChargesScreen } from "@/src/modules/finance/reconciliation/bank-charges-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"

export default function FinanceBankChargesPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <BankChargesScreen />
    </Suspense>
  )
}
