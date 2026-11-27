import { AgendaModuleSettingsScreen } from "@/src/modules/agenda/settings/agenda-module-settings-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
import { Suspense } from "react"

export default function AgendaSettingsPage() {
  return (
    <Suspense fallback={<LoadingView />}>
      <AgendaModuleSettingsScreen />
    </Suspense>
  )
}
