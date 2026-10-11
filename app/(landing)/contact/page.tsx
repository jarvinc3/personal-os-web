import { Suspense } from "react"

import { ContactScreen } from "@/src/modules/landing"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

export default function ContactPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <ContactScreen />
    </Suspense>
  )
}
