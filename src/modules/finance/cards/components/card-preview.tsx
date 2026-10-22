"use client"

import { CardNetworkMark } from "@/src/modules/finance/shared/components/brand-logo"
import { FINANCE_CARD_TYPE_LABEL } from "@/src/modules/finance/shared/constants/catalog"
import type { CardFormValues } from "@/src/modules/finance/cards/lib/card-form"
import { cn } from "@/src/shared/lib/utils"

type CardPreviewProps = {
  name: string
  type: CardFormValues["type"]
  color: string
  network: string
  lastFour: string
  availableText: string
}

export function CardPreview({
  name,
  type,
  color,
  network,
  lastFour,
  availableText,
}: CardPreviewProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 rounded-3xl p-5 text-white",
        !color && "bg-zinc-900"
      )}
      style={color ? { backgroundColor: color } : undefined}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-sm font-semibold">
          {name.trim() || "Nueva tarjeta"}
        </p>
        <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold">
          {FINANCE_CARD_TYPE_LABEL[type]}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] tracking-[0.14em] text-white/55 uppercase">
          {type === "CREDIT" ? "Disponible" : "Saldo"}
        </span>
        <span className="text-3xl font-bold tabular-nums">{availableText}</span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <span className="tracking-[0.2em] text-white/80">
          •••• {lastFour || "····"}
        </span>
        <CardNetworkMark network={network} logoUrl={null} size={28} />
      </div>
    </div>
  )
}
