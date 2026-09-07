"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

export type HeaderVariant = "primary" | "secondary"

export type PageHeaderConfig = {
  variant?: HeaderVariant
  title?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  accentColor?: string
  showSidebarTrigger?: boolean
  showNotificationBell?: boolean
  showUserMenu?: boolean
  onBack?: () => void
}

export type ResolvedPageHeaderConfig = {
  variant: HeaderVariant
  title?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  accentColor?: string
  showSidebarTrigger: boolean
  showNotificationBell: boolean
  showUserMenu: boolean
  onBack?: () => void
}

const DEFAULT_CONFIG: ResolvedPageHeaderConfig = {
  variant: "primary",
  showSidebarTrigger: true,
  showNotificationBell: true,
  showUserMenu: true,
}

function resolveConfig(config: PageHeaderConfig): ResolvedPageHeaderConfig {
  const variant = config.variant ?? "primary"
  const isSecondary = variant === "secondary"

  return {
    variant,
    title: config.title,
    subtitle: config.subtitle,
    actions: config.actions,
    accentColor: config.accentColor,
    showSidebarTrigger: config.showSidebarTrigger ?? !isSecondary,
    showNotificationBell: config.showNotificationBell ?? !isSecondary,
    showUserMenu: config.showUserMenu ?? !isSecondary,
    onBack: config.onBack,
  }
}

type HeaderContextValue = {
  config: ResolvedPageHeaderConfig
  setConfig: (config: PageHeaderConfig) => void
  resetConfig: () => void
}

const HeaderContext = createContext<HeaderContextValue | null>(null)

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] =
    useState<ResolvedPageHeaderConfig>(DEFAULT_CONFIG)

  const setConfig = useCallback((next: PageHeaderConfig) => {
    setConfigState((prev) => {
      const resolved = resolveConfig(next)
      if (
        prev.variant === resolved.variant &&
        prev.title === resolved.title &&
        prev.subtitle === resolved.subtitle &&
        prev.actions === resolved.actions &&
        prev.accentColor === resolved.accentColor &&
        prev.showSidebarTrigger === resolved.showSidebarTrigger &&
        prev.showNotificationBell === resolved.showNotificationBell &&
        prev.showUserMenu === resolved.showUserMenu &&
        prev.onBack === resolved.onBack
      ) {
        return prev
      }
      return resolved
    })
  }, [])

  const resetConfig = useCallback(() => {
    setConfigState((prev) => (prev === DEFAULT_CONFIG ? prev : DEFAULT_CONFIG))
  }, [])

  const value = useMemo(
    () => ({ config, setConfig, resetConfig }),
    [config, setConfig, resetConfig]
  )

  return (
    <HeaderContext.Provider value={value}>{children}</HeaderContext.Provider>
  )
}

export function useHeaderContext() {
  const context = useContext(HeaderContext)
  if (!context) {
    throw new Error("useHeaderContext must be used within HeaderProvider")
  }
  return context
}
