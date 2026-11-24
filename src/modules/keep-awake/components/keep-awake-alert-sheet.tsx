"use client"

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

import { MonitorPlay, XIcon } from "lucide-react"

type KeepAwakeAlertSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeepAwakeAlertSheet({
  open,
  onOpenChange,
}: KeepAwakeAlertSheetProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <SheetHeader
          title="Cómo funciona"
          description="Keep Awake mantiene la pantalla despierta en esta ventana."
        />
        <SheetBody>
          <Alert>
            <MonitorPlay />
            <AlertTitle>Miniplayer no disponible</AlertTitle>
            <AlertDescription>
              Document Picture-in-Picture no está disponible en este navegador.
              Puedes activar Keep Awake igual; el bloqueo funciona en esta
              pestaña.
            </AlertDescription>
          </Alert>
        </SheetBody>
        <DrawerFooter className={SHEET_FOOTER_CLASS}>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4 shrink-0" aria-hidden="true" />
            Cerrar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
