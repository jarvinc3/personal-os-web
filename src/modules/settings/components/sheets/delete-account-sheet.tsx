"use client"

import { useAuth } from "@/src/modules/auth"
import { AuthServiceError } from "@/src/modules/auth"
import { useDeleteAccount } from "@/src/modules/settings/hooks/use-delete-account"
import { reauthenticateWithPassword } from "@/src/modules/settings/hooks/use-wipe-user-data"
import {
  fetchCurrentAuthIdentities,
  hasEmailPasswordProvider,
  isGoogleOnlyAccount,
} from "@/src/modules/settings/lib/auth-providers"
import { setPendingAccountDeletion } from "@/src/modules/settings/lib/pending-account-deletion"
import { resolveReauthConfirmMode } from "@/src/modules/settings/lib/wipe-confirm"
import type { SettingsSheetProps } from "@/src/modules/settings/types/sheet.types"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/shared/components/ui/alert-dialog"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { AlertTriangle, KeyRound, Trash2, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

const DELETED_DATA_ITEMS = [
  "Perfil, preferencias y configuración de módulos",
  "Datos financieros, transacciones y presupuestos",
  "Historial del agente IA y sesiones",
  "Tokens OAuth de Gmail y fuentes conectadas",
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

  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string>()
  const [verifiedPassword, setVerifiedPassword] = useState<string | null>(null)
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false)
  const [alertOpen, setAlertOpen] = useState(false)
  const passwordRef = useRef("")
  const passwordVerified =
    verifiedPassword !== null && verifiedPassword === password.trim()
  const [sessionOpen, setSessionOpen] = useState(open)
  if (open !== sessionOpen) {
    setSessionOpen(open)
    if (open) {
      setPassword("")
      setPasswordError(undefined)
      setVerifiedPassword(null)
      setAlertOpen(false)
    }
  }
  const [canDeleteInApp, setCanDeleteInApp] = useState<boolean | null>(null)
  const [isGoogleOnly, setIsGoogleOnly] = useState(false)
  const [isLoadingProviders, setIsLoadingProviders] = useState(false)

  const loadAuthProviders = useCallback(async () => {
    setIsLoadingProviders(true)
    try {
      const { identities } = await fetchCurrentAuthIdentities()
      if (!identities?.length) {
        setCanDeleteInApp(Boolean(email))
        setIsGoogleOnly(false)
        return
      }
      setCanDeleteInApp(hasEmailPasswordProvider(identities))
      setIsGoogleOnly(isGoogleOnlyAccount(identities))
    } catch {
      setCanDeleteInApp(Boolean(email))
      setIsGoogleOnly(false)
    } finally {
      setIsLoadingProviders(false)
    }
  }, [email])

  useEffect(() => {
    if (!open) {
      return
    }
    passwordRef.current = ""
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAuthProviders()
  }, [open, loadAuthProviders])

  const clearPassword = () => {
    setPassword("")
    passwordRef.current = ""
    setPasswordError(undefined)
    setVerifiedPassword(null)
  }

  const handleContinue = () => {
    clearPassword()
    onOpenChange(false)
    setAlertOpen(true)
  }

  const handlePasswordChange = (value: string) => {
    passwordRef.current = value
    setPassword(value)
    setVerifiedPassword(null)
    setPasswordError(undefined)
  }

  const handlePasswordBlur = async () => {
    const current = passwordRef.current.trim()
    if (!current) {
      setVerifiedPassword(null)
      return
    }
    setIsVerifyingPassword(true)
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
      setIsVerifyingPassword(false)
    }
  }

  const handleConfirmDelete = () => {
    if (!passwordVerified) {
      return
    }
    deleteAfterReauth.mutate(undefined, {
      onSettled: () => setAlertOpen(false),
    })
  }

  const handleGoogleReauth = () => {
    setPendingAccountDeletion()
    onOpenChange(false)
    loginWithGoogleMutation.mutate({ next: APP_ROUTES.app.settings })
  }

  const confirmMode = resolveReauthConfirmMode({
    isLoadingProviders,
    canConfirmInApp: canDeleteInApp,
    isGoogleOnly,
  })

  const confirmAction =
    confirmMode === "pending" ? (
      <Button variant="destructive" className="flex-1" disabled>
        <Spinner data-icon="inline-start" />
        Continuar
      </Button>
    ) : confirmMode === "google" ? (
      <Button
        variant="destructive"
        className="flex-1"
        disabled={loginWithGoogleMutation.isPending}
        onClick={handleGoogleReauth}
      >
        {loginWithGoogleMutation.isPending ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <Trash2 data-icon="inline-start" />
        )}
        {loginWithGoogleMutation.isPending
          ? "Confirmando con Google..."
          : "Confirmar con Google"}
      </Button>
    ) : confirmMode === "password" ? (
      <Button
        variant="destructive"
        className="flex-1"
        disabled={deleteAfterReauth.isPending}
        onClick={handleContinue}
      >
        <Trash2 data-icon="inline-start" />
        Continuar
      </Button>
    ) : null

  return (
    <>
      <BottomSheet
        open={open}
        onOpenChange={onOpenChange}
        title="Eliminar cuenta"
        description="Esta acción es permanente e irreversible."
        actions={{ submit: confirmAction }}
      >
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
              Confirma tu identidad con Google para eliminar la cuenta. Serás
              redirigido a Google y, al volver, podrás confirmar la eliminación
              definitiva.
            </AlertDescription>
          </Alert>
        ) : null}

        {confirmMode === "unavailable" ? (
          <Alert variant="destructive" className="mt-2">
            <AlertTriangle />
            <AlertTitle>No se puede confirmar</AlertTitle>
            <AlertDescription>
              Esta sesión no tiene contraseña ni un acceso solo con Google, así
              que la cuenta no se puede eliminar desde aquí.
            </AlertDescription>
          </Alert>
        ) : null}
      </BottomSheet>

      <AlertDialog
        open={alertOpen}
        onOpenChange={(next) => {
          setAlertOpen(next)
          if (!next && !deleteAfterReauth.isPending) {
            clearPassword()
          }
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar tu cuenta permanentemente?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se borrarán todos los datos asociados a {email}. Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <SummarySection title="Confirma tu contraseña" icon={KeyRound}>
            <FormTextField
              icon={KeyRound}
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => void handlePasswordBlur()}
              disabled={deleteAfterReauth.isPending || isVerifyingPassword}
              error={passwordError}
              invalid={Boolean(passwordError)}
            />
            <div className="rounded-2xl bg-muted px-4 py-3">
              <p className="text-xs text-muted-foreground">Cuenta</p>
              <p className="mt-1 text-sm text-muted-foreground">{email}</p>
            </div>
          </SummarySection>
          <AlertDialogFooter className="flex-row">
            <AlertDialogCancel
              className="flex-1"
              disabled={deleteAfterReauth.isPending}
            >
              <X data-icon="inline-start" />
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="flex-1"
              disabled={
                !passwordVerified ||
                isVerifyingPassword ||
                deleteAfterReauth.isPending
              }
              onClick={handleConfirmDelete}
            >
              {deleteAfterReauth.isPending || isVerifyingPassword ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Trash2 data-icon="inline-start" />
              )}
              {deleteAfterReauth.isPending
                ? "Eliminando..."
                : "Eliminar cuenta"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
