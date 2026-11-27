import { Suspense } from "react"

import { RecycleBinScreen } from "@/src/modules/finance/recycle-bin/recycle-bin-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"

export default function FinanceRecycleBinPage() {
  return (
    <Suspense fallback={<LoadingView />}>
      <RecycleBinScreen />
    </Suspense>
  )
}
