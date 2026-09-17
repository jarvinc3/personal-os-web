"use client"

import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { Alert, AlertDescription, AlertTitle } from "@/src/shared/components/ui/alert"
import { Button } from "@/src/shared/components/ui/button"
import { PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { MonitorPlay } from "lucide-react"

type KeepAwakeAlertSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeepAwakeAlertSheet({ open, onOpenChange }: KeepAwakeAlertSheetProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Cómo funciona"
      description="Keep Awake mantiene la pantalla despierta en esta ventana."
      actions={{
        close: (
          <Button
            type="button"
            variant="outline"
            className={PRESSABLE_CLASS}
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
        ),
      }}
    >
      <Alert>
        <MonitorPlay />
        <AlertTitle>Miniplayer no disponible</AlertTitle>
        <AlertDescription>
          Document Picture-in-Picture no está disponible en este navegador.
          Puedes activar Keep Awake igual; el bloqueo funciona en esta
          pestaña.
        </AlertDescription>
      </Alert>
    </BottomSheet>
  )
}
