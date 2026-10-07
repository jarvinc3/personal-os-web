import { Suspense } from "react"

import { FinanceTransactionEditClient } from "@/src/modules/finance/pages/finance-transaction-form"
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
      <FinanceTransactionEditClient transactionId={transactionId} />
    </Suspense>
  )
}
