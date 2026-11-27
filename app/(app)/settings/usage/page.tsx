import { UsageSettingsScreen } from "@/src/modules/settings/screens/usage-settings-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
import { Suspense } from "react"

export default function UsageSettingsRoute() {
  return (
    <Suspense fallback={<LoadingView />}>
      <UsageSettingsScreen />
    </Suspense>
  )
}
