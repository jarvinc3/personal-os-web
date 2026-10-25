"use client"

import * as Sentry from "@sentry/nextjs"
import { RefreshCwIcon } from "lucide-react"
import { useEffect } from "react"

import { AppLogo } from "@/src/shared/components/shell/app-logo"
import { Button } from "@/src/shared/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <AppLogo size="lg" />

      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Algo salió mal</h1>
          <p className="max-w-md text-base text-muted-foreground">
            No pudimos cargar esta pantalla. Vuelve a intentarlo; si el problema
            sigue, escríbenos a soporte.
          </p>
        </div>

        <div className="mt-4 flex justify-center">
          <Button
            onClick={reset}
            size="lg"
            className="shadow-[4px_4px_0px_0px_#111827] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          >
            <RefreshCwIcon className="size-4 shrink-0" />
            Reintentar
          </Button>
        </div>
      </div>
    </div>
  )
}
