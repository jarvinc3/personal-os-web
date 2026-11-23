"use client"

import type { ReauthConfirmMode } from "@/src/modules/settings/lib/wipe-confirm"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { Trash2 } from "lucide-react"

type DeleteAccountConfirmActionProps = {
  mode: ReauthConfirmMode
  isGooglePending: boolean
  isDeletePending: boolean
  onGoogleReauth: () => void
  onContinue: () => void
}

export function DeleteAccountConfirmAction({
  mode,
  isGooglePending,
  isDeletePending,
  onGoogleReauth,
  onContinue,
}: DeleteAccountConfirmActionProps) {
  if (mode === "pending") {
    return (
      <Button variant="destructive" className="flex-1" disabled>
        <Spinner data-icon="inline-start" />
        Continuar
      </Button>
    )
  }

  if (mode === "google") {
    return (
      <Button
        variant="destructive"
        className="flex-1"
        disabled={isGooglePending}
        onClick={onGoogleReauth}
      >
        {isGooglePending ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <Trash2 data-icon="inline-start" />
        )}
        {isGooglePending ? "Confirmando con Google..." : "Confirmar con Google"}
      </Button>
    )
  }

  if (mode === "password") {
    return (
      <Button
        variant="destructive"
        className="flex-1"
        disabled={isDeletePending}
        onClick={onContinue}
      >
        <Trash2 data-icon="inline-start" />
        Continuar
      </Button>
    )
  }

  return null
}
