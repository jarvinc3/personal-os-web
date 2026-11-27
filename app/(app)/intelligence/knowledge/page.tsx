import { KnowledgeScreen } from "@/src/modules/intelligence/knowledge-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
import { Suspense } from "react"

export default function IntelligenceKnowledgeRoute() {
  return (
    <Suspense fallback={<LoadingView />}>
      <KnowledgeScreen />
    </Suspense>
  )
}
