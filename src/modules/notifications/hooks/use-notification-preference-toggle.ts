"use client"

import { useProfile } from "@/src/modules/settings"
import { appToast } from "@/src/shared/lib/app-toast"
import { useCallback } from "react"

type PreferencePatch = Parameters<
  ReturnType<typeof useProfile>["updatePreferences"]
>[0]

export function useNotificationPreferenceToggle() {
  const { savePreferences } = useProfile()

  return useCallback(
    (patch: PreferencePatch, successMessage: string): Promise<void> => {
      savePreferences(patch, {
        onSuccess: () => {
          appToast.success({
            text1: "Guardado",
            text2: successMessage,
          })
        },
      })
      return Promise.resolve()
    },
    [savePreferences]
  )
}
