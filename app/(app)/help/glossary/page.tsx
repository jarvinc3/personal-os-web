import { GlossaryScreen } from "@/src/modules/help/screens/glossary-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
import { Suspense } from "react"

export default function HelpGlossaryRoute() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <GlossaryScreen />
    </Suspense>
  )
}
