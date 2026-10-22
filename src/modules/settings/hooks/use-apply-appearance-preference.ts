"use client"

import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import {
  applyAppearanceToDocument,
  writeCachedAppearance,
} from "@/src/shared/appearance"
import { useEffect, useRef } from "react"

/** Aplica la apariencia del perfil y actualiza la caché que evita el parpadeo. */
export function useApplyAppearancePreference() {
  const { preferences, profileQuery } = useProfile()
  const { style, primaryColor } = preferences.theme
  const appliedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!profileQuery.data) {
      return
    }

    const fingerprint = `${style}:${primaryColor}`
    if (appliedRef.current === fingerprint) {
      return
    }

    appliedRef.current = fingerprint
    applyAppearanceToDocument({ style, primaryColor })
    writeCachedAppearance(window.localStorage, { style, primaryColor })
  }, [primaryColor, profileQuery.data, style])
}
