import { Suspense } from "react"

import { FinanceTransferCreateClient } from "@/src/modules/finance/pages/finance-transfer-form"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

export default function FinanceTransferNewPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <FinanceTransferCreateClient />
    </Suspense>
  )
}
