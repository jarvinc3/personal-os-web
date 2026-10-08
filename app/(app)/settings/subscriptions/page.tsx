import { SubscriptionsModuleSettingsClient } from "@/src/modules/settings/pages/subscriptions-module-settings"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Suspense } from "react"

export default function SubscriptionsSettingsPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <SubscriptionsModuleSettingsClient />
    </Suspense>
  )
}
