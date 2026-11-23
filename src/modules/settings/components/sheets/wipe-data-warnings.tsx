"use client"

import type { ReauthConfirmMode } from "@/src/modules/settings/lib/wipe-confirm"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"
import { AlertTriangle, KeyRound } from "lucide-react"

type WipeDataAuthAlertsProps = {
  confirmMode: ReauthConfirmMode
}

export function WipeDataAuthAlerts({ confirmMode }: WipeDataAuthAlertsProps) {
  if (confirmMode === "google") {
    return (
      <Alert variant="destructive">
        <AlertTriangle />
        <AlertTitle>Cuenta vinculada con Google</AlertTitle>
        <AlertDescription>
          Confirma tu identidad con Google para vaciar los datos. Serás
          redirigido a Google y, al volver, podrás confirmar el vaciado.
        </AlertDescription>
      </Alert>
    )
  }

  if (confirmMode === "unavailable") {
    return (
      <Alert variant="destructive">
        <AlertTriangle />
        <AlertTitle>No se puede confirmar</AlertTitle>
        <AlertDescription>
          Esta sesión no tiene contraseña ni un acceso solo con Google, así que
          el vaciado no se puede confirmar desde aquí.
        </AlertDescription>
      </Alert>
    )
  }

  return null
}

export function WipeDataIrreversibleAlert() {
  return (
    <Alert variant="destructive">
      <KeyRound />
      <AlertTitle>Esto no se puede deshacer</AlertTitle>
      <AlertDescription>
        No hay papelera ni copia de seguridad. Los datos vaciados no vuelven.
      </AlertDescription>
    </Alert>
  )
}
