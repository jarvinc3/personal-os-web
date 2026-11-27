import { HelpScreen } from "@/src/modules/help/screens/help-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
import { Suspense } from "react"

export default function HelpRoute() {
  return (
    <Suspense fallback={<LoadingView />}>
      <HelpScreen />
    </Suspense>
  )
}
