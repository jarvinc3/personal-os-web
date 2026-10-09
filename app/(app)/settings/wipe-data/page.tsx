import { WipeDataSettingsClient } from "@/src/modules/settings/pages/wipe-data-settings"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Suspense } from "react"

export default function WipeDataSettingsPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <WipeDataSettingsClient />
    </Suspense>
  )
}
