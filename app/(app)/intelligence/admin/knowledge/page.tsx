import { KnowledgeAdminScreen } from "@/src/modules/intelligence/knowledge-admin-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
import { Suspense } from "react"

export default function IntelligenceAdminKnowledgeRoute() {
  return (
    <Suspense fallback={<LoadingView />}>
      <KnowledgeAdminScreen />
    </Suspense>
  )
}
