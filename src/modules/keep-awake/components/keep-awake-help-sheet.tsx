"use client"

import { SheetBody } from "@/src/shared/components/sheets/sheet-body"
import { SheetHeader } from "@/src/shared/components/sheets/sheet-header"
import { SHEET_FOOTER_CLASS } from "@/src/shared/components/sheets/sheet-layout"
import { Button } from "@/src/shared/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/src/shared/components/ui/drawer"
import { cn } from "@/src/shared/lib/utils"
import { Bell, MonitorPlay, PanelsTopLeft, Play, XIcon } from "lucide-react"

const STEPS = [
  {
    title: "Activa",
    description: "Bloquea el apagado de pantalla con un toque.",
    icon: Play,
  },
  {
    title: "Miniplayer",
    description: "Flota el control y el tiempo encima de otras ventanas.",
    icon: MonitorPlay,
  },
  {
    title: "Navega",
    description:
      "Puedes cambiar de sección en Personal OS; el bloqueo sigue en esta ventana. Si ocultas la pestaña, se reanuda al volver.",
    icon: PanelsTopLeft,
  },
  {
    title: "Recordatorio",
    description: "Guardar lo enciende. Al sonar, confirma para activar.",
    icon: Bell,
  },
] as const

type KeepAwakeHelpSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeepAwakeHelpSheet({
  open,
  onOpenChange,
}: KeepAwakeHelpSheetProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <SheetHeader
          title="Cómo funciona"
          description="Keep Awake mantiene la pantalla despierta en esta ventana."
        />
        <SheetBody>
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isLast = index === STEPS.length - 1
            return (
              <div
                key={step.title}
                className={cn(
                  "flex items-start gap-3 py-3",
                  !isLast && "border-b border-border/60"
                )}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Icon className="size-5 text-muted-foreground" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
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
