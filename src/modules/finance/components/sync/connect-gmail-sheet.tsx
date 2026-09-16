"use client"

import { useStartGmailOAuth } from "@/src/modules/finance/hooks/use-gmail-oauth"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { appToast } from "@/src/shared/lib/app-toast"
import { MailIcon } from "lucide-react"

type ConnectGmailSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  emailSyncEnabled: boolean
}

export function ConnectGmailSheet({
  open,
  onOpenChange,
  emailSyncEnabled,
}: ConnectGmailSheetProps) {
  const startOAuth = useStartGmailOAuth()

  async function onSubmit() {
    if (!emailSyncEnabled) {
      appToast.error({
        text1: "Sincronización de correo desactivada",
        text2: "Actívala en Ajustes → Finanzas.",
      })
      return
    }
    try {
      await startOAuth.mutateAsync()
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Conectar Gmail"
      description="Solo lectura (gmail.readonly). Autorizas el buzón una vez; los bancos se ligan después."
      actions={{
        close: (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
        ),
        submit: (
          <Button
            type="button"
            disabled={startOAuth.isPending || !emailSyncEnabled}
            className="flex-1"
            onClick={() => void onSubmit()}
          >
            {startOAuth.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : null}
            Ir a Google
          </Button>
        ),
      }}
    >
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <MailIcon className="size-12 text-muted-foreground" aria-hidden />
        {!emailSyncEnabled ? (
          <p className="text-sm text-destructive">
            Activa la sincronización de correo en Ajustes antes de conectar
            Gmail.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Google vuelve a Correos. Luego eliges la institución y el correo
            desde el que el banco manda las notificaciones.
          </p>
        )}
      </div>
    </BottomSheet>
  )
}
