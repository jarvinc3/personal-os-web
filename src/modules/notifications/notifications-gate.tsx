"use client"

import { useAuthGuard } from "@/src/modules/auth"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
import type { ReactNode } from "react"

export function NotificationsGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthGuard()

  if (isLoading || !isAuthenticated) {
    return <LoadingView variant="screen" />
  }

  return children
}
