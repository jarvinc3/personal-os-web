import { Suspense } from "react"

import { TransferCreateScreen } from "@/src/modules/finance/transactions/transfer-form-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"

export default function FinanceTransferNewPage() {
  return (
    <Suspense fallback={<LoadingView />}>
      <TransferCreateScreen />
    </Suspense>
  )
}
