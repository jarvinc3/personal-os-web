"use client"

import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import type {
  DeepPartial,
  UserPreferences,
} from "@/src/modules/settings/types/profile.types"
import { appToast } from "@/src/shared/lib/app-toast"
import { useCallback } from "react"

export function usePreferenceToggle() {
  const { savePreferences } = useProfile()

  return useCallback(
    (patch: DeepPartial<UserPreferences>, successMessage: string) => {
      savePreferences(patch, {
        onSuccess: () => {
          appToast.success({ text1: "Guardado", text2: successMessage })
        },
      })
    },
    [savePreferences]
  )
}
