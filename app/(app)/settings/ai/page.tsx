import { AiSettingsScreen } from "@/src/modules/settings/screens/ai-settings-screen"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Suspense } from "react"

export default function AiSettingsRoute() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <AiSettingsScreen />
    </Suspense>
  )
}
