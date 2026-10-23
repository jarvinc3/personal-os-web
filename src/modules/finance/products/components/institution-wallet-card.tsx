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

export type InstitutionWalletDetail = "none" | "counts" | "balance"

type InstitutionWalletCardProps = {
  card: InstitutionCardModel
  isFront?: boolean
  isPending?: boolean
  onDragActiveChange?: (dragging: boolean) => void
  onCycle?: (delta: number) => void
  onPress?: () => void
  /** PROVISIONAL (#272): draft for the card gallery; #290 retires the gallery. */
  variant?: "full" | "compact"
  /** What the compact card shows under the name. Ignored by `full`. */
  detail?: InstitutionWalletDetail
}

export function ProductCountItem({
  icon: Icon,
  count,
  label,
  compact = false,
}: {
  icon: LucideIcon
  count: number
  label: string
  compact?: boolean
}) {
  return (
    <span className="inline-flex items-center gap-1.5" title={label}>
      <Icon
        className={compact ? "size-3.5 shrink-0" : "size-5 shrink-0"}
        aria-hidden
      />
      <span>{count}</span>
    </span>
  )
}

function IrregularityMarks({
  irregularities,
}: {
  irregularities: InstitutionCardModel["irregularities"]
}) {
  if (!irregularities.drift && !irregularities.reconciliation) {
    return null
  }
  return (
    <span className="flex items-center gap-1">
      {irregularities.drift ? (
        <span
          className="size-2 rounded-full bg-destructive ring-2 ring-white/60"
          title="Descuadre"
        />
      ) : null}
      {irregularities.reconciliation ? (
        <span
          className="size-2 rounded-full bg-warning ring-2 ring-white/60"
          title="Sin conciliar"
        />
      ) : null}
    </span>
  )
}

function InstitutionProductCounts({
  counts,
  compact = false,
}: {
  counts: InstitutionStackCounts
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center font-semibold text-white tabular-nums",
        compact ? "gap-2 text-xs" : "gap-3 text-base"
      )}
    >
      <ProductCountItem
        icon={LandmarkIcon}
        count={counts.accounts}
        label="Cuentas"
        compact={compact}
      />
      <span className={cn("w-px bg-white/40", compact ? "h-3" : "h-4")} />
      <ProductCountItem
        icon={CreditCardIcon}
        count={counts.cards}
        label="Tarjetas"
        compact={compact}
      />
      <span className={cn("w-px bg-white/40", compact ? "h-3" : "h-4")} />
      <ProductCountItem
        icon={HandCoinsIcon}
        count={counts.loans}
        label="Préstamos"
        compact={compact}
      />
    </div>
  )
}

function InstitutionCompactBalance({ card }: { card: InstitutionCardModel }) {
  if (card.balanceLines.length === 0) {
    return (
      <span className="shrink-0 text-right font-mono text-sm font-semibold text-white tabular-nums">
        {card.balanceAmount}
      </span>
    )
  }

  return (
    <span className="flex shrink-0 flex-col items-end gap-0.5">
      {card.balanceLines.map((line) => (
        <span
          key={line.currency}
          className="flex items-baseline gap-1 text-sm font-semibold text-white tabular-nums"
        >
          {card.balanceLines.length > 1 ? (
            <span className="text-[10px] font-medium text-white/60">
              {line.currency}
            </span>
          ) : null}
          <span className="font-mono">{line.amount}</span>
        </span>
      ))}
    </span>
  )
}

export function InstitutionWalletCard({
  card,
  isFront = true,
  isPending = false,
  onDragActiveChange,
  onCycle,
  onPress,
  variant = "full",
  detail = "balance",
}: InstitutionWalletCardProps) {
  const dropClickRef = useRef(false)
  const isCash = card.item.kind === "cash" || card.isCash
  const KindIcon =
    card.item.kind === "institution" ? Building2Icon : CreditCardIcon
  const canDrag = variant === "full" && isFront && !isPending

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

  // PROVISIONAL (#272): draft for the card gallery; #290 retires the gallery.
  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        aria-busy={isPending || undefined}
        aria-label={`Abrir ${card.name}`}
        className={cn(
          "relative flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-2xl p-3 text-left text-white outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          isPending && "pointer-events-none"
        )}
        style={{ backgroundColor: card.color }}
      >
        <span aria-hidden className="pointer-events-none absolute inset-0">
          <span className="absolute -top-8 -right-6 size-24 rounded-full bg-white/20" />
          <span className="absolute top-6 -right-10 size-28 rounded-full bg-white/10" />
        </span>

        {isCash ? (
          <span
            aria-hidden
            className="relative z-10 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-emerald-700"
          >
            <BanknoteIcon className="size-5" strokeWidth={2.25} />
          </span>
        ) : (
          <BrandLogo
            name={card.name || card.monogram}
            logoUrl={card.logoUrl}
            size={36}
            className="relative z-10 shrink-0"
          />
        )}

        <span className="relative z-10 flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold">{card.name}</span>
          {detail === "counts" && card.counts ? (
            <InstitutionProductCounts counts={card.counts} compact />
          ) : null}
          {detail === "balance" ? (
            <span className="truncate text-xs text-white/70">
              {card.balanceLabel}
            </span>
          ) : null}
        </span>

        {detail === "balance" ? (
          <InstitutionCompactBalance card={card} />
        ) : null}

        <span className="relative z-10 flex shrink-0 items-center gap-1.5">
          <IrregularityMarks irregularities={card.irregularities} />
          <KindIcon
            className="size-4 shrink-0"
            style={{ color: "rgba(255,255,255,0.6)" }}
            aria-hidden
          />
        </span>

        {isPending ? (
          <PendingSurface
            className="rounded-2xl bg-black/45"
            spinnerClassName="size-6 text-white"
          />
        ) : null}
      </button>
    )
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
        {isCash ? (
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
        <span className="flex items-center gap-2">
          <IrregularityMarks irregularities={card.irregularities} />
          <KindIcon
            className="size-5"
            style={{ color: "rgba(255,255,255,0.6)" }}
          />
        </span>
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
        {card.balanceLines.length === 0 ? (
          <span className="text-right font-mono text-2xl font-semibold text-white tabular-nums">
            {card.balanceAmount}
          </span>
        ) : (
          card.balanceLines.map((line) => (
            <span
              key={line.currency}
              className="flex items-baseline justify-between gap-2"
            >
              {card.balanceLines.length > 1 ? (
                <span className="text-xs text-white/60">{line.currency}</span>
              ) : null}
              <span
                className={cn(
                  "flex-1 text-right font-mono font-semibold text-white tabular-nums",
                  card.balanceLines.length > 1 ? "text-lg" : "text-2xl"
                )}
              >
                {line.amount}
              </span>
            </span>
          ))
        )}
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
