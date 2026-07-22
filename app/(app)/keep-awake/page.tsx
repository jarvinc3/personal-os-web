import { Suspense } from "react"

import { KeepAwakeClient } from "@/src/modules/keep-awake/pages/keep-awake-client"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

export default function KeepAwakePage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <KeepAwakeClient />
    </Suspense>
  )
}
