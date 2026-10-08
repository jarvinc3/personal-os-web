import { AgendaModuleSettingsClient } from "@/src/modules/settings/pages/agenda-module-settings"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Suspense } from "react"

export default function AgendaSettingsPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <AgendaModuleSettingsClient />
    </Suspense>
  )
}
