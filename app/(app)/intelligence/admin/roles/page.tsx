import { AdminRolesScreen } from "@/src/modules/intelligence/admin-roles-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
import { Suspense } from "react"

export default function IntelligenceAdminRolesRoute() {
  return (
    <Suspense fallback={<LoadingView />}>
      <AdminRolesScreen />
    </Suspense>
  )
}
