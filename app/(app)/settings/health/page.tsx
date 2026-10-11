import { HealthModuleSettingsScreen } from "@/src/modules/settings"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Suspense } from "react"

export default function HealthSettingsPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <HealthModuleSettingsScreen />
    </Suspense>
  )
}
