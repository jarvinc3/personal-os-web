import { Suspense } from "react"

import { FinanceTransactionDetailClient } from "@/src/modules/finance/components/transactions/finance-transaction-detail-view"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

type FinanceTransactionDetailPageProps = {
  params: Promise<{ transactionId: string }>
}

export default async function FinanceTransactionDetailPage({
  params,
}: FinanceTransactionDetailPageProps) {
  const { transactionId } = await params
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <FinanceTransactionDetailClient transactionId={transactionId} />
    </Suspense>
  )
}
