"use client"

import { useAuthGuard } from "@/src/modules/auth"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"

export function AiGate({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuthGuard()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(APP_ROUTES.auth.login)
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !isAuthenticated) {
    return <LoadingView variant="screen" />
  }

  return children
}
