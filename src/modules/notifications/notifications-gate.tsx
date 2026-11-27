"use client"

import { useAuthGuard } from "@/src/modules/auth"
import type { ReactNode } from "react"
import { Spinner } from "@/src/shared/components/ui/spinner"

export function NotificationsGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthGuard()

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen w-full flex-1 items-center justify-center">
        <Spinner className="size-6" />
      </div>
    )
  }

  return children
}
