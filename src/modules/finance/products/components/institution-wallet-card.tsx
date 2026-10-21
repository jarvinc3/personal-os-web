"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import type { InstitutionStackCounts } from "@/src/modules/finance/shared/lib/institution-stack"
import type { InstitutionCardModel } from "@/src/modules/finance/products/lib/institution-card"
import {
  classifyWalletGesture,
  isWalletDragOnly,
  walletGestureDelta,
} from "@/src/modules/finance/shared/lib/wallet-gesture"
import { PendingSurface } from "@/src/shared/components/ui/navigation-pending"
import { cn } from "@/src/shared/lib/utils"
import { motion } from "framer-motion"
import {
  BanknoteIcon,
  Building2Icon,
  CreditCardIcon,
  HandCoinsIcon,
  LandmarkIcon,
  type LucideIcon,
} from "lucide-react"
import { useRef } from "react"

type InstitutionWalletCardProps = {
  card: InstitutionCardModel
  isFront?: boolean
  isPending?: boolean
  onDragActiveChange?: (dragging: boolean) => void
  onCycle?: (delta: number) => void
  onPress?: () => void
}

export function ProductCountItem({
  icon: Icon,
  count,
  label,
}: {
  icon: LucideIcon
  count: number
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-1.5" title={label}>
      <Icon className="size-5" aria-hidden />
      <span>{count}</span>
    </span>
  )
}

function InstitutionProductCounts({
  counts,
}: {
  counts: InstitutionStackCounts
}) {
  return (
    <div className="flex items-center gap-3 text-base font-semibold text-white tabular-nums">
      <ProductCountItem
        icon={LandmarkIcon}
        count={counts.accounts}
        label="Cuentas"
      />
      <span className="h-4 w-px bg-white/40" />
      <ProductCountItem
        icon={CreditCardIcon}
        count={counts.cards}
        label="Tarjetas"
      />
      <span className="h-4 w-px bg-white/40" />
      <ProductCountItem
        icon={HandCoinsIcon}
        count={counts.loans}
        label="Préstamos"
      />
    </div>
  )
}

export function InstitutionWalletCard({
  card,
  isFront = true,
  isPending = false,
  onDragActiveChange,
  onCycle,
  onPress,
}: InstitutionWalletCardProps) {
  const dropClickRef = useRef(false)
  const KindIcon =
    card.item.kind === "institution" ? Building2Icon : CreditCardIcon
  const canDrag = isFront && !isPending

  function onDragEnd(offsetX: number) {
    const gesture = classifyWalletGesture(offsetX)
    // The browser fires a click when the pointer lifts after a drag; dropping
    // it here is what keeps the tap after the swipe working on the first try.
    dropClickRef.current = isWalletDragOnly(offsetX)
    onDragActiveChange?.(false)
    const delta = walletGestureDelta(gesture)
    if (delta !== 0) {
      onCycle?.(delta)
    }
  }

  function onClick() {
    if (isPending) {
      return
    }
    if (dropClickRef.current) {
      dropClickRef.current = false
      return
    }
    onPress?.()
  }

  return (
    <motion.button
      type="button"
      drag={canDrag ? "x" : false}
      dragConstraints={{ left: -180, right: 180 }}
      // The page scroll stays vertical: a diagonal drag does not become a swipe.
      dragDirectionLock
      dragElastic={0.4}
      dragSnapToOrigin
      disabled={isPending}
      aria-busy={isPending || undefined}
      aria-label={`Abrir ${card.name}`}
      onPointerDown={() => {
        // A new gesture starts clean: a click still owed from the previous drag
        // is already dispatched, so the tap that follows opens the card.
        dropClickRef.current = false
      }}
      onDragStart={() => onDragActiveChange?.(true)}
      onDragEnd={(_event, panInfo) => onDragEnd(panInfo.offset.x)}
      whileTap={isPending ? undefined : { scale: 0.985 }}
      onClick={onClick}
      className={cn(
        "relative flex h-60 w-full cursor-pointer flex-col justify-between overflow-hidden rounded-3xl p-6 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        isPending && "pointer-events-none"
      )}
      style={{ backgroundColor: card.color }}
    >
      <span aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute -top-16 -right-8 size-52 rounded-full bg-white/20" />
        <span className="absolute top-14 -right-14 size-64 rounded-full bg-white/10" />
      </span>
      <div className="relative z-10 flex items-start justify-between">
        {card.item.kind === "cash" || card.isCash ? (
          <span
            aria-hidden
            className="inline-flex size-11 items-center justify-center rounded-full bg-white text-emerald-700"
          >
            <BanknoteIcon className="size-7" strokeWidth={2.25} />
          </span>
        ) : (
          <BrandLogo
            name={card.name || card.monogram}
            logoUrl={card.logoUrl}
            size={44}
          />
        )}
        <KindIcon
          className="size-5"
          style={{ color: "rgba(255,255,255,0.6)" }}
        />
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center">
        <h3 className="font-display text-3xl leading-tight font-bold text-white">
          {card.name}
        </h3>
        {card.counts ? (
          <InstitutionProductCounts counts={card.counts} />
        ) : (
          <p className="text-base font-semibold text-white">
            {card.productSummary}
          </p>
        )}
      </div>

      {isFront ? (
        <div
          aria-hidden
          className="absolute inset-x-6 z-10 flex justify-between"
          style={{ bottom: "72px" }}
        >
          {Array.from({ length: 12 }).map((_, index) => (
            <span
              key={index}
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "var(--canvas)", opacity: 0.45 }}
            />
          ))}
        </div>
      ) : null}

      <div className="relative z-10 flex flex-col">
        <span className="text-xs tracking-wider text-white/60 uppercase">
          {card.balanceLabel}:
        </span>
        <span className="text-right font-mono text-2xl font-semibold text-white tabular-nums">
          {card.balanceAmount}
        </span>
      </div>

      {isPending ? (
        <PendingSurface
          className="rounded-3xl bg-black/45"
          spinnerClassName="size-8 text-white"
        />
      ) : null}
    </motion.button>
  )
}
