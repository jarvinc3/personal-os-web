import SettingsClient from "@/src/modules/settings/pages/settings-client"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Suspense } from "react"

export default function SettingsRoute() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <SettingsClient />
    </Suspense>
  )
}
