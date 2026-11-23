"use client"

import type { ReauthPasswordControls } from "@/src/modules/settings/hooks/use-reauth-password"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { ConfirmDialog } from "@/src/shared/components/feedback/confirm-dialog"
import { FormTextField } from "@/src/shared/components/forms/form-text-field"
import { KeyRound, Trash2 } from "lucide-react"

type DeleteAccountConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string
  deletePending: boolean
  password: ReauthPasswordControls
  onConfirm: () => void
}

export function DeleteAccountConfirmDialog({
  open,
  onOpenChange,
  email,
  deletePending,
  password,
  onConfirm,
}: DeleteAccountConfirmDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      tone="danger"
      icon={Trash2}
      wide
      title="¿Eliminar tu cuenta permanentemente?"
      description={`Se borrarán todos los datos asociados a ${email}. Esta acción no se puede deshacer.`}
      confirmLabel="Eliminar cuenta"
      confirmIcon={Trash2}
      pending={deletePending}
      pendingLabel="Eliminando..."
      confirmDisabled={!password.isVerified || password.isVerifying}
      onConfirm={onConfirm}
    >
      <SummarySection title="Confirma tu contraseña" icon={KeyRound}>
        <FormTextField
          icon={KeyRound}
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          value={password.password}
          onChange={password.changePassword}
          onBlur={() => void password.verifyPassword()}
          disabled={deletePending || password.isVerifying}
          error={password.passwordError}
          invalid={Boolean(password.passwordError)}
        />
        <div className="rounded-2xl bg-muted px-4 py-3">
          <p className="text-xs text-muted-foreground">Cuenta</p>
          <p className="mt-1 text-sm text-muted-foreground">{email}</p>
        </div>
      </SummarySection>
    </ConfirmDialog>
  )
}
