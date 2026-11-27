import { NotificationsSettingsScreen } from "@/src/modules/settings/screens/notifications-settings-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
import { Suspense } from "react"

export default function NotificationsSettingsRoute() {
  return (
    <Suspense fallback={<LoadingView />}>
      <NotificationsSettingsScreen />
    </Suspense>
  )
}
