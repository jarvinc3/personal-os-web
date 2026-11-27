import { FinanceCurrenciesSettingsScreen } from "@/src/modules/finance/settings/finance-currencies-settings-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
import { Suspense } from "react"

export default function FinanceCurrenciesSettingsPage() {
  return (
    <Suspense fallback={<LoadingView />}>
      <FinanceCurrenciesSettingsScreen />
    </Suspense>
  )
}
