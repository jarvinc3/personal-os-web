"use client"

import { useAuthGuard } from "@/src/modules/auth"
import { KeepAwakeStatusPanel } from "@/src/modules/keep-awake/components/keep-awake-status-panel"
import { PipPanel } from "@/src/modules/keep-awake/components/pip-panel"
import { useWakeLock } from "@/src/modules/keep-awake/hooks/use-wake-lock"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { cn } from "@/src/shared/lib/utils"
import { Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { createPortal } from "react-dom"

const STEPS = [
  {
    num: "01",
    title: "Activa",
    body: "Bloquea el apagado de pantalla con un toque.",
  },
  {
    num: "02",
    title: "Miniplayer",
    body: "Flota el control y el tiempo encima de otras apps.",
  },
  {
    num: "03",
    title: "Sigue",
    body: "Cambia de pestaña; el bloqueo se mantiene activo.",
  },
] as const

export function KeepAwakeClient() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuthGuard()
  const {
    active,
    elapsedSeconds,
    pipOpen,
    pipMount,
    supportsPip,
    supportsWakeLock,
    toggle,
    openPip,
  } = useWakeLock()

  usePageHeader({ title: "Keep Awake" }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(APP_ROUTES.auth.login)
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !isAuthenticated) {
    return <LoadingView variant="screen" />
  }

  return (
    <>
      <div className="relative mx-auto flex max-w-2xl flex-col gap-8 p-4 pb-16 md:px-6">
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 opacity-70",
            "bg-[radial-gradient(ellipse_at_20%_0%,color-mix(in_oklab,var(--primary)_45%,transparent),transparent_55%)]"
          )}
          aria-hidden
        />

        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="size-3.5" aria-hidden />
            </span>
            <span className="text-base font-semibold tracking-tight">
              Keep Awake
            </span>
          </div>
          <span className="rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Wake Lock
          </span>
        </header>

        <section className="flex flex-col gap-6">
          <div>
            <h1 className="mb-3 text-4xl leading-[0.95] font-bold tracking-tight md:text-5xl">
              Keep{" "}
              <span className="bg-linear-to-br from-foreground to-primary bg-clip-text text-transparent">
                Awake
              </span>
            </h1>
            <p className="max-w-[34ch] text-base leading-relaxed text-muted-foreground">
              Evita que la pantalla se apague mientras trabajas, lees o das una
              presentación. El cronómetro vive en el miniplayer.
            </p>
          </div>

          <KeepAwakeStatusPanel
            active={active}
            pipOpen={pipOpen}
            supportsPip={supportsPip}
            supportsWakeLock={supportsWakeLock}
            onToggle={() => void toggle()}
            onOpenPip={() => void openPip()}
          />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold tracking-tight">
            Cómo usarlo
          </h2>
          <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {STEPS.map((step) => (
              <li
                key={step.num}
                className="rounded-xl border border-border bg-card/80 p-4"
              >
                <span className="mb-1.5 block text-[0.7rem] font-bold tracking-widest text-primary">
                  {step.num}
                </span>
                <strong className="mb-1 block text-sm font-semibold">
                  {step.title}
                </strong>
                <span className="text-xs leading-snug text-muted-foreground">
                  {step.body}
                </span>
              </li>
            ))}
          </ol>

          {!supportsPip ? (
            <p className="mt-3 rounded-xl border border-dashed border-border px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
              El miniplayer no está disponible en este navegador. Puedes activar
              Keep Awake igual; el bloqueo funciona en la pestaña.
            </p>
          ) : null}
        </section>
      </div>

      {pipOpen && pipMount
        ? createPortal(
            <PipPanel
              active={active}
              elapsedSeconds={elapsedSeconds}
              onToggle={() => void toggle()}
            />,
            pipMount
          )
        : null}
    </>
  )
}
