"use client"

import { resolveAuthGuardState } from "@/src/modules/auth/lib/auth-guard-state"
import { useAppStore } from "@/src/shared/store/app-store"
import { useMemo } from "react"

export function useAuthGuard() {
  const bootstrapped = useAppStore((state) => state.bootstrapped)
  const user = useAppStore((state) => state.user)

  return useMemo(
    () => resolveAuthGuardState({ bootstrapped, user }),
    [bootstrapped, user]
  )
}
