import { Suspense } from "react"

import { LoanDetailScreen } from "@/src/modules/finance/loans/loan-detail-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"

type FinanceLoanDetailPageProps = {
  params: Promise<{ loanId: string }>
}

export default async function FinanceLoanDetailPage({
  params,
}: FinanceLoanDetailPageProps) {
  const { loanId } = await params
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <LoanDetailScreen loanId={loanId} />
    </Suspense>
  )
}
