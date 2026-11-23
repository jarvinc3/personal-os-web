"use client"

import type { ReauthConfirmMode } from "@/src/modules/settings/lib/wipe-confirm"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { Trash2 } from "lucide-react"

type WipeDataConfirmActionProps = {
  mode: ReauthConfirmMode
  hasSelection: boolean
  isGooglePending: boolean
  isWipePending: boolean
  onGoogle: () => void
  onContinue: () => void
}

export function WipeDataConfirmAction({
  mode,
  hasSelection,
  isGooglePending,
  isWipePending,
  onGoogle,
  onContinue,
}: WipeDataConfirmActionProps) {
  if (mode === "pending") {
    return (
      <Button variant="destructive" className="w-full" disabled>
        <Spinner data-icon="inline-start" />
        Continuar
      </Button>
    )
  }

  if (mode === "google") {
    return (
      <Button
        variant="destructive"
        className="w-full"
        disabled={!hasSelection || isGooglePending}
        onClick={onGoogle}
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
        className="w-full"
        disabled={!hasSelection || isWipePending}
        onClick={onContinue}
      >
        {isWipePending ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <Trash2 data-icon="inline-start" />
        )}
        Continuar
      </Button>
    )
  }

  return null
}
