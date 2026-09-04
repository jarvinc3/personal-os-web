"use client"

import { ThemeProvider } from "@/src/providers/theme-provider"
import { useTheme } from "next-themes"
import { useLayoutEffect, useRef, type ReactNode } from "react"

function applyLandingLight() {
  const root = document.documentElement
  root.dataset.forcedTheme = "light"
  root.style.colorScheme = "light"
  if (root.classList.contains("dark")) {
    root.classList.remove("dark")
  }
  if (!root.classList.contains("light")) {
    root.classList.add("light")
  }
}

export function LandingTheme({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme()
  const resolvedThemeRef = useRef(resolvedTheme)

  useLayoutEffect(() => {
    resolvedThemeRef.current = resolvedTheme
  }, [resolvedTheme])

  useLayoutEffect(() => {
    applyLandingLight()
    const root = document.documentElement
    const observer = new MutationObserver(applyLandingLight)
    observer.observe(root, { attributes: true, attributeFilter: ["class"] })

    return () => {
      observer.disconnect()
      delete root.dataset.forcedTheme
      root.classList.remove("light")
      if (resolvedThemeRef.current === "dark") {
        root.classList.add("dark")
        root.style.colorScheme = "dark"
      } else {
        root.classList.add("light")
        root.style.colorScheme = "light"
      }
    }
  }, [])

  return (
    <ThemeProvider
      forcedTheme="light"
      enableSystem={false}
      attribute="data-landing-theme"
    >
      {children}
    </ThemeProvider>
  )
}
