"use client"

import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { Button } from "@/src/shared/components/ui/button"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { MonitorPlay, PanelsTopLeft, Play } from "lucide-react"

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
] as const

type KeepAwakeHelpSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeepAwakeHelpSheet({ open, onOpenChange }: KeepAwakeHelpSheetProps) {
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
    </BottomSheet>
  )
}
