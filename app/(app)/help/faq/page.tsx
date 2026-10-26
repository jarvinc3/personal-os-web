import { FaqScreen } from "@/src/modules/help/screens/faq-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
import { Suspense } from "react"

export default function HelpFaqRoute() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <FaqScreen />
    </Suspense>
  )
}
