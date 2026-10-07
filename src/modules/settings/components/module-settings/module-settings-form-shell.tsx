"use client"

import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import type { ReactNode } from "react"

type ModuleSettingsFormShellProps = {
  onSubmit: () => void
  canSave: boolean
  pending: boolean
  children: ReactNode
}

export function ModuleSettingsFormShell({
  onSubmit,
  canSave,
  pending,
  children,
}: ModuleSettingsFormShellProps) {
  return (
    <form
      className="-mb-4 flex h-[calc(100dvh-var(--header-height)-1rem)] flex-col gap-4 md:-mb-16"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
        {children}
      </div>
      <div className="shrink-0 border-t bg-background px-0 pt-3 pb-4">
        <Button
          type="submit"
          className="h-11 w-full"
          disabled={!canSave || pending}
        >
          {pending ? <Spinner data-icon="inline-start" /> : null}
          {pending ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </form>
  )
}
