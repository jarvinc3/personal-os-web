import { IntelligenceScreen } from "@/src/modules/intelligence/intelligence-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
import { Suspense } from "react"

export default function IntelligenceRoute() {
  return (
    <Suspense fallback={<LoadingView />}>
      <IntelligenceScreen />
    </Suspense>
  )
}
