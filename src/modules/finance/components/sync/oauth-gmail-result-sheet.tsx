"use client"

import { parseOAuthSuccessParam } from "@/src/modules/finance/lib/gmail-oauth"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { Button } from "@/src/shared/components/ui/button"
import { CheckCircle2Icon, CircleXIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"

type OauthGmailResultSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OauthGmailResultSheet({
  open,
  onOpenChange,
}: OauthGmailResultSheetProps) {
  const searchParams = useSearchParams()
  const state = parseOAuthSuccessParam(searchParams.get("success"))
  const ok = state === "ok"
  const Icon = ok ? CheckCircle2Icon : CircleXIcon

  return (
    <BottomSheet
      open={open}
      variant="floating"
      onOpenChange={onOpenChange}
      title={ok ? "Gmail conectado" : "No se pudo conectar Gmail"}
      description={
        ok
          ? "El buzón quedó autorizado. Ya puedes ligar una institución."
          : "Google no autorizó la cuenta o el retorno falló. No se importó nada."
      }
      actions={{
        close: (
          <Button
            type="button"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
        ),
      }}
    >
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <Icon
          className={
            ok
              ? "size-20 text-emerald-600"
              : "size-20 text-destructive"
          }
          aria-hidden
        />
        <p className="text-sm text-muted-foreground">
          {ok
            ? "Añade el correo desde el que el banco envía las notificaciones de movimientos."
            : "Vuelve a intentar Conectar Gmail."}
        </p>
      </div>
    </BottomSheet>
  )
}
