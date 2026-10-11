import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { LoginScreen } from "@/src/modules/auth"
import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede a tu cuenta de Personal OS.",
}

export default function LoginRoute() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <LoginScreen />
    </Suspense>
  )
}
