"use client"

import type { ConfigurableModuleSlug } from "@/src/modules/settings/types/module-config.types"
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

type PendingActivations = Readonly<
  Partial<Record<ConfigurableModuleSlug, boolean>>
>

type PendingModuleActivationsValue = {
  pendingActivations: PendingActivations
  setPendingActivation: (
    slug: ConfigurableModuleSlug,
    enabled: boolean | null
  ) => void
  clearPendingActivations: () => void
}

const PendingModuleActivationsContext =
  createContext<PendingModuleActivationsValue | null>(null)

/**
 * Switches a settings panel changed but has not saved yet, so the Apps list
 * can tell a pending activation from a saved one. It lives with the settings
 * screen: closing the panel drops it and the list shows the saved state again.
 */
export function PendingModuleActivationsProvider({
  children,
}: {
  children: ReactNode
}) {
  const [pendingActivations, setPending] = useState<PendingActivations>({})

  const setPendingActivation = useCallback(
    (slug: ConfigurableModuleSlug, enabled: boolean | null) => {
      setPending((current) => {
        if (enabled === null) {
          if (!(slug in current)) {
            return current
          }
          const next = { ...current }
          delete next[slug]
          return next
        }
        if (current[slug] === enabled) {
          return current
        }
        return { ...current, [slug]: enabled }
      })
    },
    []
  )

  const clearPendingActivations = useCallback(() => {
    setPending((current) => (Object.keys(current).length === 0 ? current : {}))
  }, [])

  const value = useMemo(
    () => ({
      pendingActivations,
      setPendingActivation,
      clearPendingActivations,
    }),
    [pendingActivations, setPendingActivation, clearPendingActivations]
  )

  return (
    <PendingModuleActivationsContext.Provider value={value}>
      {children}
    </PendingModuleActivationsContext.Provider>
  )
}

export function usePendingModuleActivations(): PendingModuleActivationsValue {
  const value = useContext(PendingModuleActivationsContext)
  if (!value) {
    throw new Error(
      "usePendingModuleActivations necesita PendingModuleActivationsProvider"
    )
  }
  return value
}
