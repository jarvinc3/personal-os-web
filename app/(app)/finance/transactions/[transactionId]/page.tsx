import { Suspense } from "react"

import { TransactionDetailScreen } from "@/src/modules/finance/transactions/transaction-detail-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"

type FinanceTransactionDetailPageProps = {
  params: Promise<{ transactionId: string }>
}

export default async function FinanceTransactionDetailPage({
  params,
}: FinanceTransactionDetailPageProps) {
  const { transactionId } = await params
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <TransactionDetailScreen transactionId={transactionId} />
    </Suspense>
  )
}
