import { Suspense } from "react"

import { FinanceLoanDetailClient } from "@/src/modules/finance/components/planning/finance-loan-detail-view"
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
      <FinanceLoanDetailClient loanId={loanId} />
    </Suspense>
  )
}
