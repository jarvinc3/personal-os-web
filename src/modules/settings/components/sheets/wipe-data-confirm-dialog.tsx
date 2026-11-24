"use client"

import type { ReauthPasswordControls } from "@/src/modules/settings/hooks/use-reauth-password"
import type { WipeRow } from "@/src/modules/settings/lib/wipe-branches"
import { FINANCE_BALANCES_BRANCH } from "@/src/modules/settings/types/wipe.types"
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
import { Button } from "@/src/shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/shared/components/ui/input-group"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { KeyRound, ShieldCheck, Trash2, XIcon } from "lucide-react"
import { useId } from "react"

type WipeDataConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  appliedRows: WipeRow[]
  balanceScopeLabel: string
  email: string
  pending: boolean
  password: ReauthPasswordControls
  onConfirm: () => void
}

function verifyLabel({
  isVerified,
  isVerifying,
}: Pick<ReauthPasswordControls, "isVerified" | "isVerifying">): string {
  if (isVerified) {
    return "Contraseña verificada"
  }
  if (isVerifying) {
    return "Verificando..."
  }
  return "Verificar"
}

export function WipeDataConfirmDialog({
  open,
  onOpenChange,
  title,
  appliedRows,
  balanceScopeLabel,
  email,
  pending,
  password,
  onConfirm,
}: WipeDataConfirmDialogProps) {
  const passwordId = useId()

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!pending) {
          onOpenChange(nextOpen)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2 aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            Esto no se puede deshacer. Se vaciarán:
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ul className="flex max-h-60 flex-col gap-2 overflow-y-auto pr-1">
          {appliedRows.map((row) => (
            <li key={row.branch.id} className="text-sm text-muted-foreground">
              • {row.label} · {row.countLabel}
              {row.draggedByLabel
                ? ` (se vacía junto con ${row.draggedByLabel})`
                : ""}
              {row.branch.id === FINANCE_BALANCES_BRANCH
                ? ` · ${balanceScopeLabel}`
                : ""}
            </li>
          ))}
        </ul>
        <SummarySection title="Confirma tu contraseña" icon={KeyRound}>
          <Field
            data-invalid={password.passwordError ? true : undefined}
            data-disabled={pending || password.isVerifying ? true : undefined}
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
                disabled={pending || password.isVerifying}
                aria-invalid={password.passwordError ? true : undefined}
              />
            </InputGroup>
            {password.passwordError ? (
              <FieldError>{password.passwordError}</FieldError>
            ) : null}
          </Field>
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full"
            disabled={
              !password.password.trim() ||
              password.isVerified ||
              password.isVerifying ||
              pending
            }
            onClick={() => void password.verifyPassword()}
          >
            {password.isVerifying ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <ShieldCheck data-icon="inline-start" />
            )}
            {verifyLabel(password)}
          </Button>
          {password.isVerified ? (
            <p className="px-1 text-xs text-muted-foreground" role="status">
              Contraseña verificada. Ya puedes vaciar los datos.
            </p>
          ) : null}
          <div className="rounded-2xl bg-muted px-4 py-3">
            <p className="text-xs text-muted-foreground">Cuenta</p>
            <p className="mt-1 text-sm text-muted-foreground">{email}</p>
          </div>
        </SummarySection>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>
            <XIcon className="size-4 shrink-0" aria-hidden="true" />
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending || !password.isVerified || password.isVerifying}
            onClick={onConfirm}
          >
            {pending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <Trash2 className="size-4 shrink-0" aria-hidden="true" />
            )}
            {pending ? "Vaciando..." : "Vaciar datos"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
