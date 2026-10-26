import { Suspense } from "react"

import { KeepAwakeScreen } from "@/src/modules/keep-awake/keep-awake-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"

export default function KeepAwakePage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <KeepAwakeScreen />
    </Suspense>
  )
}
