import { Suspense } from "react"

import { TransferCreateScreen } from "@/src/modules/finance"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

export default function FinanceTransferNewPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <TransferCreateScreen />
    </Suspense>
  )
}
