import { Suspense } from "react"

import { DeleteAccountScreen } from "@/src/modules/landing"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Eliminar cuenta",
  description:
    "Solicita la eliminación de tu cuenta de Personal OS y de todos los datos asociados.",
}

export default function DeleteAccountPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <DeleteAccountScreen />
    </Suspense>
  )
}
