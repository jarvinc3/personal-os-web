import { SettingsScreen } from "@/src/modules/settings/settings-screen"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Suspense } from "react"

export default function SettingsRoute() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <SettingsScreen />
    </Suspense>
  )
}
