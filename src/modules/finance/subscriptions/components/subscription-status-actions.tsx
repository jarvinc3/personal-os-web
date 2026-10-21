"use client"

import type { FinanceSubscription } from "@/src/modules/finance/shared/types/entities"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { PauseIcon, PlayIcon, XIcon } from "lucide-react"

type SubscriptionStatusActionsProps = {
  subscription: FinanceSubscription
  pending: { pause: boolean; resume: boolean }
  actions: { pause: () => void; resume: () => void; cancel: () => void }
}

export function SubscriptionStatusActions({
  subscription,
  pending,
  actions,
}: SubscriptionStatusActionsProps) {
  const busy = pending.pause || pending.resume

  return (
    <div className="flex flex-wrap gap-2">
      {subscription.status === "ACTIVE" ? (
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={actions.pause}
        >
          {pending.pause ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <PauseIcon className="size-4 shrink-0" />
          )}
          Pausar
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={actions.resume}
        >
          {pending.resume ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <PlayIcon className="size-4 shrink-0" />
          )}
          {subscription.status === "PAUSED" ? "Reanudar" : "Reactivar"}
        </Button>
      )}
      {subscription.status !== "CANCELLED" ? (
        <Button
          type="button"
          variant="destructive"
          disabled={busy}
          onClick={actions.cancel}
        >
          <XIcon className="size-4 shrink-0" />
          Cancelar
        </Button>
      ) : null}
    </div>
  )
}
