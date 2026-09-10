"use client"

import { useAuthGuard } from "@/src/modules/auth"
import { KeepAwakeLayout } from "@/src/modules/keep-awake/components/layout/keep-awake-layout"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { useHeaderContext } from "@/src/shared/context/header-context"
import { useRouter } from "next/navigation"
import { useEffect, useLayoutEffect, type ReactNode } from "react"

export function KeepAwakeAuthenticatedPage({
  children,
}: {
  children: ReactNode
}) {
  const router = useRouter()
  const { setConfig, resetConfig } = useHeaderContext()
  const { isAuthenticated, isLoading } = useAuthGuard()

  useLayoutEffect(() => {
    setConfig({ title: "Keep Awake" })
  }, [setConfig])

  useLayoutEffect(() => {
    return () => {
      resetConfig()
    }
  }, [resetConfig])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(APP_ROUTES.auth.login)
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !isAuthenticated) {
    return <LoadingView variant="screen" />
  }

  return <KeepAwakeLayout>{children}</KeepAwakeLayout>
}
