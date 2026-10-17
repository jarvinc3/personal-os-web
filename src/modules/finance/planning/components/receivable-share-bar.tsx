"use client"

import { Button } from "@/src/shared/components/ui/button"
import { Share2Icon } from "lucide-react"

type ReceivableShareBarProps = {
  pendingLabel: string
  disabled: boolean
  onShare: () => void
}

/** Selection footer of the cobros list: what is pending, and share it. */
export function ReceivableShareBar({
  pendingLabel,
  disabled,
  onShare,
}: ReceivableShareBarProps) {
  return (
    <div className="sticky bottom-0 z-30 flex items-center justify-between gap-3 rounded-2xl bg-neutral-900 p-3 text-white">
      <div className="min-w-0">
        <span className="block text-[11px] tracking-wide text-white/60 uppercase">
          Pendiente
        </span>
        <span className="block truncate text-xl font-bold tabular-nums">
          {pendingLabel}
        </span>
      </div>
      <Button
        type="button"
        className="shrink-0 bg-white text-neutral-900 hover:bg-white/90"
        disabled={disabled}
        onClick={onShare}
      >
        <Share2Icon className="size-4 shrink-0" aria-hidden="true" />
        Compartir
      </Button>
    </div>
  )
}
