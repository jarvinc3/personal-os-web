import { Suspense } from "react"

import { TermsScreen } from "@/src/modules/landing"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description:
    "Lee los términos y condiciones de uso de Personal OS antes de usar la plataforma.",
}

export default function TermsPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <TermsScreen />
    </Suspense>
  )
}
