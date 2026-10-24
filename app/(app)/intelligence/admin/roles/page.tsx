import { AdminRolesScreen } from "@/src/modules/intelligence/admin-roles-screen"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Suspense } from "react"

export default function IntelligenceAdminRolesRoute() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <AdminRolesScreen />
    </Suspense>
  )
}
