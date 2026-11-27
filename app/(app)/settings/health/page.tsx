import { HealthModuleSettingsScreen } from "@/src/modules/health/settings/health-module-settings-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
import { Suspense } from "react"

export default function HealthSettingsPage() {
  return (
    <Suspense fallback={<LoadingView />}>
      <HealthModuleSettingsScreen />
    </Suspense>
  )
}
