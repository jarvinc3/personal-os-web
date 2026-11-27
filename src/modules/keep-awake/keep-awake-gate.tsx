"use client"

import { useAuthGuard } from "@/src/modules/auth"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"
import { Spinner } from "@/src/shared/components/ui/spinner"

export function KeepAwakeGate({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuthGuard()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(APP_ROUTES.auth.login)
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen w-full flex-1 items-center justify-center">
        <Spinner className="size-6" />
      </div>
    )
  }

  return children
}
