import { VerifyEmailScreen } from "@/src/modules/auth/verify-email-screen"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Verificar correo",
  description:
    "Verifica tu dirección de correo electrónico para acceder a Personal OS.",
}

export default function VerifyEmailRoute() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <VerifyEmailScreen />
    </Suspense>
  )
}
