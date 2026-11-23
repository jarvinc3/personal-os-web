"use client"

import type { ReauthPasswordControls } from "@/src/modules/settings/hooks/use-reauth-password"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/src/shared/components/ui/alert-dialog"
import { FormTextField } from "@/src/shared/components/forms/form-text-field"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { KeyRound, Trash2, XIcon } from "lucide-react"

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
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!deletePending) {
          onOpenChange(nextOpen)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2 aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>
            ¿Eliminar tu cuenta permanentemente?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {`Se borrarán todos los datos asociados a ${email}. Esta acción no se puede deshacer.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
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
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deletePending}>
            <XIcon className="size-4 shrink-0" aria-hidden="true" />
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={
              deletePending || !password.isVerified || password.isVerifying
            }
            onClick={onConfirm}
          >
            {deletePending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <Trash2 className="size-4 shrink-0" aria-hidden="true" />
            )}
            {deletePending ? "Eliminando..." : "Eliminar cuenta"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
