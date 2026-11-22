import { useMemo, useState, type ReactNode } from "react"

import {
  AppRouterContext,
  type AppRouterInstance,
} from "next/dist/shared/lib/app-router-context.shared-runtime.js"
import {
  PathnameContext,
  SearchParamsContext,
} from "next/dist/shared/lib/hooks-client-context.shared-runtime.js"

type TestNextRouterProps = {
  initialPath?: string
  onNavigate?: (url: string) => void
  children: ReactNode
}

/**
 * Router de App Router para pruebas: guarda la URL en estado y avisa de cada
 * navegación. Usa los contextos internos de Next porque `next/navigation` los
 * lee directamente y no hay otro punto de inyección.
 */
export function TestNextRouter({
  initialPath = "/",
  onNavigate,
  children,
}: TestNextRouterProps) {
  const [location, setLocation] = useState(initialPath)

  const router = useMemo<AppRouterInstance>(() => {
    const navigate = (url: string) => {
      setLocation(url)
      onNavigate?.(url)
    }

    return {
      bfcacheId: "test",
      back: () => {},
      forward: () => {},
      refresh: () => {},
      prefetch: () => {},
      push: navigate,
      replace: navigate,
    }
  }, [onNavigate])

  const [pathname, search = ""] = location.split("?")
  const searchParams = useMemo(() => new URLSearchParams(search), [search])

  return (
    <AppRouterContext.Provider value={router}>
      <PathnameContext.Provider value={pathname}>
        <SearchParamsContext.Provider value={searchParams}>
          {children}
        </SearchParamsContext.Provider>
      </PathnameContext.Provider>
    </AppRouterContext.Provider>
  )
}
