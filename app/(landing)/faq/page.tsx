import { Suspense } from "react"

import { FaqScreen } from "@/src/modules/landing"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

export default function FaqPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <FaqScreen />
    </Suspense>
  )
}
