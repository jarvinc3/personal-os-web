import { FinanceCurrenciesSettingsScreen } from "@/src/modules/settings"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Suspense } from "react"

export default function FinanceCurrenciesSettingsPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <FinanceCurrenciesSettingsScreen />
    </Suspense>
  )
}
