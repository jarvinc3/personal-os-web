import { Suspense } from "react"

import { KeepAwakeScreen } from "@/src/modules/keep-awake"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

export default function KeepAwakePage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <KeepAwakeScreen />
    </Suspense>
  )
}
