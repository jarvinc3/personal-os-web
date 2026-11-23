"use client"

import {
  fetchCurrentAuthIdentities,
  hasEmailPasswordProvider,
  isGoogleOnlyAccount,
} from "@/src/modules/settings/lib/auth-providers"
import {
  resolveReauthConfirmMode,
  type ReauthConfirmMode,
} from "@/src/modules/settings/lib/wipe-confirm"
import { useCallback, useEffect, useState } from "react"

type UseAuthConfirmModeInput = {
  email: string
  /** Only loads the identities while the confirmation can be reached. */
  active: boolean
}

/**
 * Cómo puede confirmar la cuenta una acción destructiva: con contraseña, con
 * Google o con ninguna de las dos. Las identidades de auth son la fuente; el
 * modo se resuelve en un solo lugar para las dos hojas.
 */
export function useAuthConfirmMode({
  email,
  active,
}: UseAuthConfirmModeInput): ReauthConfirmMode {
  const [canConfirmInApp, setCanConfirmInApp] = useState<boolean | null>(null)
  const [isGoogleOnly, setIsGoogleOnly] = useState(false)
  const [isLoadingProviders, setIsLoadingProviders] = useState(false)

  const loadAuthProviders = useCallback(async () => {
    setIsLoadingProviders(true)
    try {
      const { identities } = await fetchCurrentAuthIdentities()
      if (!identities?.length) {
        setCanConfirmInApp(Boolean(email))
        setIsGoogleOnly(false)
        return
      }
      setCanConfirmInApp(hasEmailPasswordProvider(identities))
      setIsGoogleOnly(isGoogleOnlyAccount(identities))
    } catch {
      setCanConfirmInApp(Boolean(email))
      setIsGoogleOnly(false)
    } finally {
      setIsLoadingProviders(false)
    }
  }, [email])

  useEffect(() => {
    if (!active) {
      return
    }
    // Las identidades de auth deciden si esta cuenta confirma con contraseña.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAuthProviders()
  }, [active, loadAuthProviders])

  return resolveReauthConfirmMode({
    isLoadingProviders,
    canConfirmInApp,
    isGoogleOnly,
  })
}
