import { Suspense } from "react"

import { PrivacyScreen } from "@/src/modules/landing"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Conoce cómo Personal OS recopila, usa y protege tus datos personales.",
}

export default function PrivacyPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <PrivacyScreen />
    </Suspense>
  )
}
