import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Suspense } from "react"
import LoginPage from "./login-client"

export default function LoginRoute() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <LoginPage />
    </Suspense>
  )
}
