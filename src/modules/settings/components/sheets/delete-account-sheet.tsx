"use client"

import { useAuth } from "@/src/modules/auth"
import { DeleteAccountConfirmAction } from "@/src/modules/settings/components/sheets/delete-account-confirm-action"
import { DeleteAccountConfirmDialog } from "@/src/modules/settings/components/sheets/delete-account-confirm-dialog"
import { useAuthConfirmMode } from "@/src/modules/settings/hooks/use-auth-confirm-mode"
import { useDeleteAccount } from "@/src/modules/settings/hooks/use-delete-account"
import { useReauthPassword } from "@/src/modules/settings/hooks/use-reauth-password"
import { setPendingAccountDeletion } from "@/src/modules/settings/lib/pending-account-deletion"
import type { SettingsSheetProps } from "@/src/modules/settings/types/sheet.types"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { SheetBody } from "@/src/shared/components/sheets/sheet-body"
import { SheetHeader } from "@/src/shared/components/sheets/sheet-header"
import { SHEET_FOOTER_CLASS } from "@/src/shared/components/sheets/sheet-layout"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"
import { Button } from "@/src/shared/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/src/shared/components/ui/drawer"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { AlertTriangle, XIcon } from "lucide-react"
import { useState } from "react"

const DELETED_DATA_ITEMS = [
  "Perfil, preferencias y configuración de apps",
  "Datos financieros, transacciones y presupuestos",
  "Datos financieros y configuración de apps",
  "Tokens push y alertas",
]

type DeleteAccountSheetProps = SettingsSheetProps & {
  email: string
}

export function DeleteAccountSheet({
  open,
  onOpenChange,
  email,
}: DeleteAccountSheetProps) {
  const { deleteAfterReauth } = useDeleteAccount()
  const { loginWithGoogleMutation } = useAuth()
  const password = useReauthPassword(email)
  const [alertOpen, setAlertOpen] = useState(false)
  const [sessionOpen, setSessionOpen] = useState(open)
  if (open !== sessionOpen) {
    setSessionOpen(open)
    if (open) {
      password.clearPassword()
      setAlertOpen(false)
    }
  }
  const confirmMode = useAuthConfirmMode({ email, active: open })

  const handleContinue = () => {
    password.clearPassword()
    onOpenChange(false)
    setAlertOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!password.isVerified) {
      return
    }
    deleteAfterReauth.mutate(undefined, {
      onSettled: () => setAlertOpen(false),
    })
  }

  const handleAlertOpenChange = (next: boolean) => {
    setAlertOpen(next)
    if (!next && !deleteAfterReauth.isPending) {
      password.clearPassword()
    }
  }

  const handleGoogleReauth = () => {
    setPendingAccountDeletion()
    onOpenChange(false)
    loginWithGoogleMutation.mutate({ next: APP_ROUTES.app.settings })
  }

  const confirmAction = (
    <DeleteAccountConfirmAction
      mode={confirmMode}
      isGooglePending={loginWithGoogleMutation.isPending}
      isDeletePending={deleteAfterReauth.isPending}
      onGoogleReauth={handleGoogleReauth}
      onContinue={handleContinue}
    />
  )

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <SheetHeader
            title="Eliminar cuenta"
            description="Esta acción es permanente e irreversible."
          />
          <SheetBody>
            <SummarySection title="Se eliminará" icon={AlertTriangle}>
              <ul className="flex flex-col gap-2">
                {DELETED_DATA_ITEMS.map((item) => (
                  <li
                    key={item}
                    className="text-sm leading-relaxed text-muted-foreground"
                  >
                    • {item}
                  </li>
                ))}
              </ul>
            </SummarySection>

            {confirmMode === "google" ? (
              <Alert variant="destructive" className="mt-2">
                <AlertTriangle />
                <AlertTitle>Cuenta vinculada con Google</AlertTitle>
                <AlertDescription>
                  Confirma tu identidad con Google para eliminar la cuenta.
                  Serás redirigido a Google y, al volver, podrás confirmar la
                  eliminación definitiva.
                </AlertDescription>
              </Alert>
            ) : null}

            {confirmMode === "unavailable" ? (
              <Alert variant="destructive" className="mt-2">
                <AlertTriangle />
                <AlertTitle>No se puede confirmar</AlertTitle>
                <AlertDescription>
                  Esta sesión no tiene contraseña ni un acceso solo con Google,
                  así que la cuenta no se puede eliminar desde aquí.
                </AlertDescription>
              </Alert>
            ) : null}
          </SheetBody>
          <DrawerFooter className={SHEET_FOOTER_CLASS}>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              <XIcon className="size-4 shrink-0" aria-hidden="true" />
              Cancelar
            </Button>
            {confirmAction}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <DeleteAccountConfirmDialog
        open={alertOpen}
        onOpenChange={handleAlertOpenChange}
        email={email}
        deletePending={deleteAfterReauth.isPending}
        password={password}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
