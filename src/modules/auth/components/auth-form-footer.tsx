"use client"

import { Button } from "@/src/shared/components/ui/button"
import { Separator } from "@/src/shared/components/ui/separator"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { ExternalLink, ChevronRightIcon } from "lucide-react"

type AuthFormFooterProps = {
  primaryLabel: string
  primaryPendingLabel: string
  isPrimaryPending: boolean
  onPrimaryPress: () => void
  isGooglePending: boolean
  onGooglePress: () => void
  switchPrompt: string
  switchAction: string
  onSwitchPress: () => void
}

export function AuthFormFooter({
  primaryLabel,
  primaryPendingLabel,
  isPrimaryPending,
  onPrimaryPress,
  isGooglePending,
  onGooglePress,
  switchPrompt,
  switchAction,
  onSwitchPress,
}: AuthFormFooterProps) {
  const isBusy = isPrimaryPending || isGooglePending

  return (
    <div className="flex flex-col gap-4 pt-2">
      <Button
        type="submit"
        className="h-12 rounded-full"
        disabled={isBusy}
        onClick={onPrimaryPress}
      >
        {isPrimaryPending ? primaryPendingLabel : primaryLabel}
        {isPrimaryPending ? <Spinner data-icon="inline-start" /> : <ChevronRightIcon className="size-4 shrink-0" />}
      </Button>

      <Separator />

      <Button
        type="button"
        className="h-12 rounded-full"
        disabled={isBusy}
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
        disabled={isBusy}
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
