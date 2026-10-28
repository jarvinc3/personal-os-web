"use client"

import { resolveAuthFormGate } from "@/src/modules/auth/lib/auth-form-gate"
import { Button } from "@/src/shared/components/ui/button"
import { Separator } from "@/src/shared/components/ui/separator"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { useHydrated } from "@/src/shared/hooks/use-hydrated"
import { ExternalLink, ChevronRightIcon } from "lucide-react"

type AuthFormFooterProps = {
  formId: string
  primaryLabel: string
  primaryPendingLabel: string
  isPrimaryPending: boolean
  isGooglePending: boolean
  onGooglePress: () => void
  switchPrompt: string
  switchAction: string
  onSwitchPress: () => void
}

export function AuthFormFooter({
  formId,
  primaryLabel,
  primaryPendingLabel,
  isPrimaryPending,
  isGooglePending,
  onGooglePress,
  switchPrompt,
  switchAction,
  onSwitchPress,
}: AuthFormFooterProps) {
  const hydrated = useHydrated()
  const gate = resolveAuthFormGate({
    hydrated,
    isPending: isPrimaryPending,
    isGooglePending,
    idleLabel: primaryLabel,
    pendingLabel: primaryPendingLabel,
  })

  return (
    <div className="flex flex-col gap-4 pt-2">
      <Button
        type="submit"
        form={formId}
        className="h-12 rounded-full"
        disabled={gate.isLocked}
        aria-busy={gate.primaryBusy || undefined}
      >
        {gate.primaryLabel}
        {gate.primaryBusy ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <ChevronRightIcon className="size-4 shrink-0" />
        )}
      </Button>

      <Separator />

      <Button
        type="button"
        className="h-12 rounded-full"
        disabled={gate.isLocked}
        onClick={onGooglePress}
        variant="outline"
      >
        {isGooglePending ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <ExternalLink className="size-4.5" />
        )}
        {isGooglePending ? "Conectando..." : "Continuar con Google"}
      </Button>

      <Button
        type="button"
        className="h-9"
        disabled={gate.isLocked}
        onClick={onSwitchPress}
        variant="link"
      >
        <span className="text-sm text-muted-foreground">
          {switchPrompt}{" "}
          <span className="font-semibold text-foreground">{switchAction}</span>
        </span>
      </Button>
    </div>
  )
}
