"use client"

import { useStartGmailOAuth } from "@/src/modules/finance/shared/hooks/use-gmail-oauth"
import { useDisconnectMailbox } from "@/src/modules/finance/shared/hooks/use-email-sources"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import type { FinanceMailbox } from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
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
import { appToast } from "@/src/shared/lib/app-toast"
import { useState } from "react"
import { UnlinkIcon, XIcon } from "lucide-react"

type MailboxSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mailbox: FinanceMailbox | null
  emailSyncEnabled: boolean
  pending?: boolean
}

export function MailboxSheet({
  open,
  onOpenChange,
  mailbox,
  emailSyncEnabled,
  pending = false,
}: MailboxSheetProps) {
  const reconnect = useStartGmailOAuth()
  const disconnect = useDisconnectMailbox()
  const isPending = reconnect.isPending || disconnect.isPending

  const [confirmOpen, setConfirmOpen] = useState(false)

  async function onReconnect() {
    if (!emailSyncEnabled) {
      appToast.error({
        text1: "Sincronización de correo desactivada",
        text2: "Actívala en Ajustes → Finanzas.",
      })
      return
    }
    try {
      await reconnect.mutateAsync()
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  async function onDisconnect() {
    if (!mailbox) {
      return
    }
    try {
      await disconnect.mutateAsync(mailbox.id)
      appToast.success({ text1: "Gmail desconectado" })
      setConfirmOpen(false)
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  return (
    <>
      <BottomSheet
        open={open}
        onOpenChange={onOpenChange}
        pending={pending}
        title="Buzón de Gmail"
        description={mailbox?.emailAddress ?? "Administra este correo."}
        actions={{
          delete: mailbox ? (
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={() => setConfirmOpen(true)}
            >
              <UnlinkIcon className="size-4 shrink-0" />
              Desconectar
            </Button>
          ) : undefined,
          close: (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              <XIcon className="size-4 shrink-0" />
              Cerrar
            </Button>
          ),
          submit: (
            <Button
              type="button"
              disabled={isPending || !emailSyncEnabled}
              className="flex-1"
              onClick={() => void onReconnect()}
            >
              {isPending ? <Spinner data-icon="inline-start" /> : null}
              Reconectar
            </Button>
          ),
        }}
      >
        <p className="text-sm text-muted-foreground">
          Reconectar pide consentimiento otra vez si Google caducó el permiso.
          Desconectar oculta el buzón y sus bancos; no borra movimientos ya
          importados.
        </p>
      </BottomSheet>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!isPending) {
            setConfirmOpen(open)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Desconectar este Gmail y todas sus instituciones?
            </AlertDialogTitle>
            <AlertDialogDescription>
              No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isPending}
              onClick={() => void onDisconnect()}
            >
              Desconectar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
