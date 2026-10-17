import { Suspense } from "react"

import { TransactionEditScreen } from "@/src/modules/finance/transactions/transaction-form-screen"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

type FinanceTransactionEditPageProps = {
  params: Promise<{ transactionId: string }>
}

export default async function FinanceTransactionEditPage({
  params,
}: FinanceTransactionEditPageProps) {
  const { transactionId } = await params
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <TransactionEditScreen transactionId={transactionId} />
    </Suspense>
  )
}
