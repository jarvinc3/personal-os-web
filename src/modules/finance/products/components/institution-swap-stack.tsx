"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { isCashInstitution } from "@/src/modules/finance/shared/lib/cash"
import {
  formatProductCounts,
  formatStackItemBalance,
  institutionInitials,
  type InstitutionStackCounts,
  type InstitutionStackItem,
} from "@/src/modules/finance/shared/lib/institution-stack"
import { type FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import {
  cycleOffsetForFrontKey,
  readFrontItemKey,
  stackItemKey,
  writeFrontItemKey,
} from "@/src/modules/finance/shared/lib/wallet-front-persistence"
import {
  classifyWalletGesture,
  resetWalletGestureOffset,
} from "@/src/modules/finance/shared/lib/wallet-gesture"
import {
  WALLET_VISIBLE_COUNT,
  walletFrontIndex,
  walletPositionLabel,
  walletVisibleItems,
} from "@/src/modules/finance/shared/lib/wallet-stack"
import { Button } from "@/src/shared/components/ui/button"
import { PendingSurface } from "@/src/shared/components/ui/navigation-pending"
import { cn } from "@/src/shared/lib/utils"
import { motion } from "framer-motion"
import {
  BanknoteIcon,
  Building2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CreditCardIcon,
  HandCoinsIcon,
  LandmarkIcon,
  type LucideIcon,
} from "lucide-react"
import { type KeyboardEvent, useRef, useState, useTransition } from "react"

const FALLBACK_INSTITUTION_COLOR = "#1B4332"
const FALLBACK_CASH_COLOR = "#334155"

type InstitutionSwapStackProps = {
  items: InstitutionStackItem[]
  display: FinanceMoneyDisplay
  onSelect: (item: InstitutionStackItem) => void
  className?: string
}

type WalletCardModel = {
  item: InstitutionStackItem
  name: string
  monogram: string
  logoUrl: string | null
  color: string
  isCash: boolean
  productSummary: string
  counts: InstitutionStackCounts | null
  balanceLabel: string
  balanceAmount: string
}

function toWalletCard(
  item: InstitutionStackItem,
  display: FinanceMoneyDisplay
): WalletCardModel {
  if (item.kind === "institution") {
    return {
      item,
      name: item.institution.name,
      monogram: institutionInitials(item.institution.name),
      logoUrl: item.institution.logoUrl,
      color: item.institution.color ?? FALLBACK_INSTITUTION_COLOR,
      isCash: isCashInstitution(item.institution),
      productSummary: formatProductCounts(item.counts),
      counts: item.counts,
      balanceLabel: "Balance consolidado",
      balanceAmount: formatStackItemBalance(item, display),
    }
  }

  return {
    item,
    name: item.account.name,
    monogram: institutionInitials(item.account.name),
    logoUrl: item.account.institutionLogoUrl ?? null,
    color: item.account.color ?? FALLBACK_CASH_COLOR,
    isCash: true,
    productSummary: "Cuenta de dinero en efectivo",
    counts: null,
    balanceLabel: "Saldo",
    balanceAmount: formatStackItemBalance(item, display),
  }
}

function walletItemName(
  item: InstitutionStackItem,
  display: FinanceMoneyDisplay
): string {
  return toWalletCard(item, display).name
}

function initialCycleOffset(items: InstitutionStackItem[]): number {
  return cycleOffsetForFrontKey(items, readFrontItemKey())
}

export function InstitutionSwapStack({
  items,
  display,
  onSelect,
  className,
}: InstitutionSwapStackProps) {
  const [cycleOffset, setCycleOffset] = useState(() =>
    initialCycleOffset(items)
  )
  const [isDragging, setIsDragging] = useState(false)
  const [isPending, startTransition] = useTransition()
  const itemsSignature = items.map((item) => stackItemKey(item)).join("\0")
  const [syncedSignature, setSyncedSignature] = useState(itemsSignature)
  if (items.length > 0 && syncedSignature !== itemsSignature) {
    setSyncedSignature(itemsSignature)
    const key = readFrontItemKey()
    const next = cycleOffsetForFrontKey(items, key)
    setCycleOffset(next)
    const front = items[next]
    if (front && (!key || stackItemKey(front) !== key)) {
      writeFrontItemKey(stackItemKey(front))
    }
  }

  if (items.length === 0) {
    return null
  }

  const frontIndex = walletFrontIndex(cycleOffset, items.length)
  const position = walletPositionLabel(cycleOffset, items.length)
  const visible = walletVisibleItems(
    items,
    cycleOffset,
    WALLET_VISIBLE_COUNT
  ).map((item) => toWalletCard(item, display))
  const showCycleChrome = items.length > 1
  const frontItem = items[frontIndex]

  const persistFront = (nextOffset: number) => {
    const nextFront = items[walletFrontIndex(nextOffset, items.length)]
    if (nextFront) {
      writeFrontItemKey(stackItemKey(nextFront))
    }
  }

  const cycleBy = (delta: number) => {
    setCycleOffset((current) => {
      const next = current + delta
      persistFront(next)
      return next
    })
  }

  const showItemAt = (index: number) => {
    setCycleOffset(index)
    persistFront(index)
  }

  function onStackKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!showCycleChrome) {
      return
    }
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault()
      cycleBy(1)
      return
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault()
      cycleBy(-1)
      return
    }
    if (event.key === "Enter" || event.key === " ") {
      if (event.target !== event.currentTarget) {
        return
      }
      event.preventDefault()
      if (frontItem) {
        startTransition(() => onSelect(frontItem))
      }
    }
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <div
        className={cn(
          "relative h-80 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          isDragging && "z-50"
        )}
        tabIndex={showCycleChrome ? 0 : undefined}
        role={showCycleChrome ? "group" : undefined}
        aria-label={
          showCycleChrome
            ? `Cartera de instituciones, ${position.current} de ${position.total}`
            : undefined
        }
        onKeyDown={onStackKeyDown}
      >
        {visible.map((card, pos) => {
          const isFront = pos === 0
          const x = pos * 12
          const y = pos * 22
          const rotate = pos * 3.5
          const scale = 1 - pos * 0.05
          const opacity = 1 - pos * 0.15
          return (
            <motion.div
              key={`${card.item.kind}-${card.item.id}`}
              className="absolute top-0 right-8 left-0"
              initial={false}
              animate={{
                x,
                y,
                rotate,
                scale,
                opacity,
                zIndex: isFront && isDragging ? 80 : 30 - pos,
              }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              style={{
                transformOrigin: "bottom center",
                pointerEvents: isFront ? "auto" : "none",
              }}
            >
              <InstitutionWalletCard
                kind={card.item.kind}
                name={card.name}
                monogram={card.monogram}
                logoUrl={card.logoUrl}
                color={card.color}
                isCash={card.isCash}
                productSummary={card.productSummary}
                counts={card.counts}
                balanceLabel={card.balanceLabel}
                balanceAmount={card.balanceAmount}
                isFront={isFront}
                isPending={isFront && isPending}
                onDragActiveChange={isFront ? setIsDragging : undefined}
                onCycle={() => cycleBy(1)}
                onPress={() => {
                  startTransition(() => onSelect(card.item))
                }}
              />
            </motion.div>
          )
        })}
      </div>

      {showCycleChrome ? (
        <div className="flex flex-col items-center gap-2 px-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Institución anterior"
              onClick={() => cycleBy(-1)}
            >
              <ChevronLeftIcon />
            </Button>
            <div className="flex items-center gap-1.5">
              {items.map((item, index) => {
                const isFront = index === frontIndex
                const name = walletItemName(item, display)
                return (
                  <button
                    key={`${item.kind}-${item.id}`}
                    type="button"
                    aria-label={name}
                    aria-current={isFront ? "true" : undefined}
                    className={cn(
                      "size-2 rounded-full transition-colors",
                      isFront ? "bg-foreground" : "bg-muted-foreground/40"
                    )}
                    onClick={() => showItemAt(index)}
                  />
                )
              })}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Siguiente institución"
              onClick={() => cycleBy(1)}
            >
              <ChevronRightIcon />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

type InstitutionWalletCardProps = {
  kind: InstitutionStackItem["kind"]
  name: string
  monogram: string
  logoUrl: string | null
  color: string
  isCash?: boolean
  productSummary: string
  counts: InstitutionStackCounts | null
  balanceLabel: string
  balanceAmount: string
  isFront?: boolean
  isPending?: boolean
  onDragActiveChange?: (dragging: boolean) => void
  onCycle?: () => void
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

function InstitutionWalletCard({
  kind,
  name,
  monogram,
  logoUrl,
  color,
  isCash = false,
  productSummary,
  counts,
  balanceLabel,
  balanceAmount,
  isFront = true,
  isPending = false,
  onDragActiveChange,
  onCycle,
  onPress,
}: InstitutionWalletCardProps) {
  const offsetYRef = useRef(resetWalletGestureOffset())
  const KindIcon = kind === "institution" ? Building2Icon : CreditCardIcon

  return (
    <motion.button
      type="button"
      drag={isFront && !isPending ? "y" : false}
      dragConstraints={{ top: -180, bottom: 0 }}
      dragElastic={0.5}
      dragSnapToOrigin
      disabled={isPending}
      aria-busy={isPending || undefined}
      onPointerDown={() => {
        offsetYRef.current = resetWalletGestureOffset()
      }}
      onDragStart={() => onDragActiveChange?.(true)}
      onDrag={(_event, info) => {
        offsetYRef.current = info.offset.y
      }}
      onDragEnd={(_event, info) => {
        offsetYRef.current = info.offset.y
        onDragActiveChange?.(false)
        if (classifyWalletGesture(info.offset.y) === "cycle") {
          onCycle?.()
        }
      }}
      whileTap={isPending ? undefined : { scale: 0.985 }}
      onClick={() => {
        if (isPending) {
          return
        }
        if (classifyWalletGesture(offsetYRef.current) === "press") {
          onPress?.()
        }
      }}
      className={cn(
        "relative flex h-60 w-full cursor-pointer flex-col justify-between overflow-hidden rounded-3xl p-6 text-left",
        isPending && "pointer-events-none"
      )}
      style={{ backgroundColor: color }}
    >
      <span aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute -top-16 -right-8 size-52 rounded-full bg-white/20" />
        <span className="absolute top-14 -right-14 size-64 rounded-full bg-white/10" />
      </span>
      <div className="relative z-10 flex items-start justify-between">
        {kind === "cash" || isCash ? (
          <span
            aria-label={name}
            className="inline-flex size-11 items-center justify-center rounded-full bg-white text-emerald-700"
          >
            <BanknoteIcon className="size-7" strokeWidth={2.25} aria-hidden />
          </span>
        ) : (
          <BrandLogo name={name || monogram} logoUrl={logoUrl} size={44} />
        )}
        <KindIcon
          className="size-5"
          style={{ color: "rgba(255,255,255,0.6)" }}
        />
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center">
        <h3 className="font-display text-3xl leading-tight font-bold text-white">
          {name}
        </h3>
        {counts ? (
          <InstitutionProductCounts counts={counts} />
        ) : (
          <p className="text-base font-semibold text-white">{productSummary}</p>
        )}
      </div>

      {isFront ? (
        <div
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
          {balanceLabel}:
        </span>
        <span className="text-right font-mono text-2xl font-semibold text-white tabular-nums">
          {balanceAmount}
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
