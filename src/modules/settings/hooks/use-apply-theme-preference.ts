"use client"

import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import { getSettingValue } from "@/src/modules/settings/lib/settings-value"
import type { ThemeValue } from "@/src/modules/settings/types/profile.types"
import { useAppStore } from "@/src/shared/store/app-store"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

export function useApplyThemePreference() {
  const pathname = usePathname()
  const session = useAppStore((state) => state.session)
  const { setTheme } = useTheme()
  const { preferences, profileQuery } = useProfile()
  const themeValue = getSettingValue<ThemeValue>(preferences.theme)
  const appliedThemeRef = useRef<string | null>(null)

  useEffect(() => {
    if (!session || !profileQuery.data) {
      return
    }
    if (
      typeof document !== "undefined" &&
      document.documentElement.dataset.forcedTheme === "light"
    ) {
      return
    }
    if (!themeValue || appliedThemeRef.current === themeValue) {
      return
    }
    appliedThemeRef.current = themeValue
    setTheme(themeValue === "system" ? "system" : themeValue)
  }, [pathname, profileQuery.data, session, setTheme, themeValue])
}
