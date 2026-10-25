"use client"

import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePendingModuleActivations } from "@/src/modules/settings/hooks/use-pending-module-activations"
import { ConfirmDialog } from "@/src/shared/components/feedback/confirm-dialog"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { Trash2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useState, type ReactNode } from "react"

type SettingsSecondaryPageProps = {
  title: string
  children: ReactNode
}

export function SettingsSecondaryPage({
  title,
  children,
}: SettingsSecondaryPageProps) {
  const router = useRouter()
  const { pendingActivations, clearPendingActivations } =
    usePendingModuleActivations()
  const [discardOpen, setDiscardOpen] = useState(false)
  const hasPendingActivation = Object.keys(pendingActivations).length > 0

  const leave = useCallback(() => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push(APP_ROUTES.app.settings)
  }, [router])

  const handleBack = useCallback(() => {
    if (hasPendingActivation) {
      setDiscardOpen(true)
      return
    }
    leave()
  }, [hasPendingActivation, leave])

  usePageHeader(
    {
      variant: "secondary",
      title,
      onBack: handleBack,
    },
    [title, handleBack]
  )

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 pb-16 md:px-6">
      {children}

      <ConfirmDialog
        open={discardOpen}
        onOpenChange={setDiscardOpen}
        tone="danger"
        icon={Trash2Icon}
        title="¿Descartar el cambio?"
        description="La app no queda activa hasta que guardes. Si sales ahora, sigue como estaba."
        cancelLabel="Seguir editando"
        confirmLabel="Descartar"
        confirmIcon={Trash2Icon}
        onConfirm={() => {
          setDiscardOpen(false)
          clearPendingActivations()
          leave()
        }}
      />
    </div>
  )
}
