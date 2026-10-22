import { GuidesScreen } from "@/src/modules/help/screens/guides-screen"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Suspense } from "react"

export default function HelpGuidesRoute() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <GuidesScreen />
    </Suspense>
  )
}
