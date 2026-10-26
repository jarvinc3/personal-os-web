import { ModulesSettingsScreen } from "@/src/modules/settings/screens/modules-settings-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
import { Suspense } from "react"

export default function ModulesSettingsRoute() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <ModulesSettingsScreen />
    </Suspense>
  )
}
