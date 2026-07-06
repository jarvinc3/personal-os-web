"use client"

import {
  useHeaderContext,
  type PageHeaderConfig,
} from "@/src/shared/context/header-context"
import { useLayoutEffect, type DependencyList } from "react"

/**
 * Configures the app shell header for the current page.
 *
 * - Call from client page components under `app/(app)/`.
 * - Avoid duplicating page titles in the body when set here.
 * - Memoize `actions` when they depend on component state.
 * - Header resets automatically on unmount.
 */
export function usePageHeader(
  config: PageHeaderConfig,
  deps: DependencyList = []
) {
  const { setConfig, resetConfig } = useHeaderContext()

  useLayoutEffect(() => {
    setConfig(config)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setConfig, ...deps])

  useLayoutEffect(() => {
    return resetConfig
  }, [resetConfig])
}
