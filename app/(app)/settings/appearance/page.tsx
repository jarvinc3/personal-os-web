import { AppearanceSettingsScreen } from "@/src/modules/settings/screens/appearance-settings-screen"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Suspense } from "react"

export default function AppearanceSettingsRoute() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <AppearanceSettingsScreen />
    </Suspense>
  )
}
