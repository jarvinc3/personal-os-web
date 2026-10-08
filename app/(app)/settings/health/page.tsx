import { HealthModuleSettingsClient } from "@/src/modules/settings/pages/health-module-settings"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Suspense } from "react"

export default function HealthSettingsPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <HealthModuleSettingsClient />
    </Suspense>
  )
}
