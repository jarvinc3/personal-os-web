import { Suspense } from "react"

import { LoanEditScreen } from "@/src/modules/finance/loans/loan-form-screen"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

type FinanceLoanEditPageProps = {
  params: Promise<{ loanId: string }>
}

export default async function FinanceLoanEditPage({
  params,
}: FinanceLoanEditPageProps) {
  const { loanId } = await params
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <LoanEditScreen loanId={loanId} />
    </Suspense>
  )
}
