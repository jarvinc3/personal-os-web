"use client"

import { useAuthGuard } from "@/src/modules/auth"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, type ReactNode } from "react"

type SettingsSecondaryPageProps = {
  title: string
  children: ReactNode
}

export function SettingsSecondaryPage({
  title,
  children,
}: SettingsSecondaryPageProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuthGuard()

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push(APP_ROUTES.app.settings)
  }, [router])

  usePageHeader(
    {
      variant: "secondary",
      title,
      onBack: handleBack,
    },
    [title, handleBack],
  )

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(APP_ROUTES.auth.login)
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !isAuthenticated) {
    return <LoadingView variant="screen" />
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 pb-16 md:px-6">
      {children}
    </div>
  )
}
