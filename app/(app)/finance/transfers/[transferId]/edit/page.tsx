import { Suspense } from "react"

import { TransferEditScreen } from "@/src/modules/finance/transactions/transfer-form-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"

type FinanceTransferEditPageProps = {
  params: Promise<{ transferId: string }>
}

export default async function FinanceTransferEditPage({
  params,
}: FinanceTransferEditPageProps) {
  const { transferId } = await params
  return (
    <Suspense fallback={<LoadingView />}>
      <TransferEditScreen transactionId={transferId} />
    </Suspense>
  )
}
