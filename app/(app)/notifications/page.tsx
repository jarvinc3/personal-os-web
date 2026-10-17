import { Suspense } from "react"

import { NotificationsScreen } from "@/src/modules/notifications/notifications-screen"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

export default function NotificationsPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <NotificationsScreen />
    </Suspense>
  )
}
