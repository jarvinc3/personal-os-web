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
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/shared/components/ui/input-group"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { KeyRound, Trash2, XIcon } from "lucide-react"
import { useId } from "react"

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
  const passwordId = useId()

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
          <Field
            data-invalid={password.passwordError ? true : undefined}
            data-disabled={
              deletePending || password.isVerifying ? true : undefined
            }
            className="gap-0.5"
          >
            <FieldLabel
              htmlFor={passwordId}
              className="pl-2 text-sm text-muted-foreground"
            >
              Contraseña
            </FieldLabel>
            <InputGroup className="h-10 overflow-hidden px-1">
              <InputGroupAddon align="inline-start">
                <KeyRound className="text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                id={passwordId}
                type="password"
                autoComplete="current-password"
                value={password.password}
                onChange={(event) =>
                  password.changePassword(event.target.value)
                }
                onBlur={() => void password.verifyPassword()}
                disabled={deletePending || password.isVerifying}
                aria-invalid={password.passwordError ? true : undefined}
              />
            </InputGroup>
            {password.passwordError ? (
              <FieldError>{password.passwordError}</FieldError>
            ) : null}
          </Field>
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
