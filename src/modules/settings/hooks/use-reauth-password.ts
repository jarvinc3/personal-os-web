"use client"

import { AuthServiceError } from "@/src/modules/auth"
import { reauthenticateWithPassword } from "@/src/modules/settings/hooks/use-wipe-user-data"
import { useRef, useState } from "react"

export type ReauthPasswordControls = {
  password: string
  passwordError: string | undefined
  isVerifying: boolean
  isVerified: boolean
  changePassword: (value: string) => void
  verifyPassword: () => Promise<void>
  clearPassword: () => void
}

/**
 * Contraseña que confirma una acción destructiva. La verificación es la misma
 * para las dos hojas que la piden; cada una decide cuándo dispararla.
 */
export function useReauthPassword(email: string): ReauthPasswordControls {
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string>()
  const [verifiedPassword, setVerifiedPassword] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const passwordRef = useRef("")
  const isVerified =
    verifiedPassword !== null && verifiedPassword === password.trim()

  const changePassword = (value: string) => {
    passwordRef.current = value
    setPassword(value)
    setVerifiedPassword(null)
    setPasswordError(undefined)
  }

  const clearPassword = () => {
    setPassword("")
    passwordRef.current = ""
    setPasswordError(undefined)
    setVerifiedPassword(null)
  }

  const verifyPassword = async () => {
    const current = passwordRef.current.trim()
    if (!current) {
      return
    }
    setIsVerifying(true)
    try {
      await reauthenticateWithPassword(email, current)
      if (passwordRef.current.trim() !== current) {
        return
      }
      setVerifiedPassword(current)
      setPasswordError(undefined)
    } catch (error) {
      if (passwordRef.current.trim() !== current) {
        return
      }
      setVerifiedPassword(null)
      setPasswordError(
        error instanceof AuthServiceError
          ? error.message
          : "La contraseña no es correcta."
      )
    } finally {
      setIsVerifying(false)
    }
  }

  return {
    password,
    passwordError,
    isVerifying,
    isVerified,
    changePassword,
    verifyPassword,
    clearPassword,
  }
}
