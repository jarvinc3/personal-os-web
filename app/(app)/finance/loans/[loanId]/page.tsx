import { Suspense } from "react"

import { LoanDetailScreen } from "@/src/modules/finance"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

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
