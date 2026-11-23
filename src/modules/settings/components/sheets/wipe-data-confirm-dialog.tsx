"use client"

import type { ReauthPasswordControls } from "@/src/modules/settings/hooks/use-reauth-password"
import type { WipeRow } from "@/src/modules/settings/lib/wipe-branches"
import { FINANCE_BALANCES_BRANCH } from "@/src/modules/settings/types/wipe.types"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { ConfirmDialog } from "@/src/shared/components/feedback/confirm-dialog"
import { FormTextField } from "@/src/shared/components/forms/form-text-field"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { KeyRound, ShieldCheck, Trash2 } from "lucide-react"

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
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      tone="danger"
      icon={Trash2}
      wide
      title={title}
      description="Esto no se puede deshacer. Se vaciarán:"
      confirmLabel="Vaciar datos"
      confirmIcon={Trash2}
      pending={pending}
      pendingLabel="Vaciando..."
      confirmDisabled={!password.isVerified || password.isVerifying}
      onConfirm={onConfirm}
    >
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
        <FormTextField
          icon={KeyRound}
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          value={password.password}
          onChange={password.changePassword}
          disabled={pending || password.isVerifying}
          error={password.passwordError}
          invalid={Boolean(password.passwordError)}
        />
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
    </ConfirmDialog>
  )
}
