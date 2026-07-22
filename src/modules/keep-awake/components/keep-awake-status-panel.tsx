"use client"

import { Button } from "@/src/shared/components/ui/button"
import { cn } from "@/src/shared/lib/utils"
import { MonitorPlay, Pause, Play } from "lucide-react"

type KeepAwakeStatusPanelProps = {
  active: boolean
  pipOpen: boolean
  supportsPip: boolean
  supportsWakeLock: boolean
  onToggle: () => void
  onOpenPip: () => void
}

export function KeepAwakeStatusPanel({
  active,
  pipOpen,
  supportsPip,
  supportsWakeLock,
  onToggle,
  onOpenPip,
}: KeepAwakeStatusPanelProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow",
        active && "shadow-[0_0_0_1px_var(--success)/20]"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-[10%] top-0 h-px bg-linear-to-r from-transparent via-primary to-transparent transition-opacity",
          active ? "opacity-100" : "opacity-40"
        )}
        aria-hidden
      />

      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Estado
          </span>
          <span
            className="text-xl font-semibold tracking-tight text-foreground"
            aria-live="polite"
          >
            {active ? "Activo" : "Inactivo"}
          </span>
        </div>
        <span
          className={cn(
            "size-3 shrink-0 rounded-full transition-colors",
            active
              ? "animate-pulse bg-success shadow-[0_0_0_6px_color-mix(in_oklab,var(--success)_25%,transparent)]"
              : "bg-danger/70"
          )}
          aria-hidden
        />
      </div>

      <p className="mb-5 min-h-[2.6em] text-sm leading-relaxed text-muted-foreground">
        {!supportsWakeLock
          ? "Tu navegador no soporta Wake Lock. Prueba Chrome, Edge o un navegador reciente."
          : active
            ? "La pantalla se mantiene despierta. Abre el miniplayer para ver el tiempo de sesión."
            : "Activa el bloqueo de pantalla y, si quieres, abre el miniplayer para seguir el tiempo en una esquina."}
      </p>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          className={cn(
            "min-w-40 flex-1",
            active && "bg-success text-white hover:bg-success/90"
          )}
          disabled={!supportsWakeLock}
          onClick={onToggle}
          title={active ? "Desactivar" : "Activar"}
        >
          {active ? (
            <Pause className="size-4" aria-hidden />
          ) : (
            <Play className="size-4" aria-hidden />
          )}
          {active ? "Pausar" : "Activar"}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="min-w-36 flex-1"
          disabled={!supportsPip || pipOpen}
          onClick={onOpenPip}
          title={pipOpen ? "Miniplayer abierto" : "Abrir miniplayer"}
        >
          <MonitorPlay className="size-4" aria-hidden />
          Miniplayer
        </Button>
      </div>
    </div>
  )
}
