import { FinanceModuleSettingsScreen } from "@/src/modules/settings"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Suspense } from "react"

export default function FinanceSettingsPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <FinanceModuleSettingsScreen />
    </Suspense>
  )
}
