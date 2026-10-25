"use client"

import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"

import { MonitorPlay } from "lucide-react"

type KeepAwakeAlertSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeepAwakeAlertSheet({
  open,
  onOpenChange,
}: KeepAwakeAlertSheetProps) {
  return (
    <BottomSheet
      closeLabel="Cerrar"
      open={open}
      onOpenChange={onOpenChange}
      title="Cómo funciona"
      description="Keep Awake mantiene la pantalla despierta en esta ventana."
    >
      <Alert>
        <MonitorPlay />
        <AlertTitle>Miniplayer no disponible</AlertTitle>
        <AlertDescription>
          Document Picture-in-Picture no está disponible en este navegador.
          Puedes activar Keep Awake igual; el bloqueo funciona en esta pestaña.
        </AlertDescription>
      </Alert>
    </BottomSheet>
  )
}
