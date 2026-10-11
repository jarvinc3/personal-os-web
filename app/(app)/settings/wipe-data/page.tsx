import { WipeDataSettingsScreen } from "@/src/modules/settings"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Suspense } from "react"

export default function WipeDataSettingsPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <WipeDataSettingsScreen />
    </Suspense>
  )
}
