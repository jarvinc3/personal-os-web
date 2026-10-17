import { Suspense } from "react"

import { LoanCreateScreen } from "@/src/modules/finance/loans/loan-form-screen"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

export default function FinanceLoanNewPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <LoanCreateScreen />
    </Suspense>
  )
}
