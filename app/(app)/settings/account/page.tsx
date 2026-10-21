import { AccountSettingsScreen } from "@/src/modules/settings/screens/account-settings-screen"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Suspense } from "react"

export default function AccountSettingsRoute() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <AccountSettingsScreen />
    </Suspense>
  )
}
