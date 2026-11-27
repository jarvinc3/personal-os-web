import { PrivacySettingsScreen } from "@/src/modules/settings/screens/privacy-settings-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
import { Suspense } from "react"

export default function PrivacySettingsRoute() {
  return (
    <Suspense fallback={<LoadingView />}>
      <PrivacySettingsScreen />
    </Suspense>
  )
}
