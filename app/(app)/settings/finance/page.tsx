import { FinanceModuleSettingsScreen } from "@/src/modules/finance/settings/finance-module-settings-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
import { Suspense } from "react"

export default function FinanceSettingsPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <FinanceModuleSettingsScreen />
    </Suspense>
  )
}
