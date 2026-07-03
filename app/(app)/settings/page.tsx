import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Suspense } from "react"
import SettingsPage from "./settings-client"

export default function SettingsRoute() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <SettingsPage />
    </Suspense>
  )
}
