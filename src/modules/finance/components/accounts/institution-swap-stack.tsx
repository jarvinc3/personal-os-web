"use client"

import { BrandLogo } from "@/src/modules/finance/components/brand-logo";
import {
  formatProductCounts,
  formatStackItemBalance,
  institutionInitials,
  type InstitutionStackItem,
} from "@/src/modules/finance/lib/institution-stack";
import {
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/lib/money";
import {
  cycleOffsetForFrontKey,
  readFrontItemKey,
  stackItemKey,
  writeFrontItemKey,
} from "@/src/modules/finance/lib/wallet-front-persistence";
import {
  classifyWalletGesture,
  resetWalletGestureOffset,
} from "@/src/modules/finance/lib/wallet-gesture";
import {
  WALLET_VISIBLE_COUNT,
  walletFrontIndex,
  walletPositionLabel,
  walletVisibleItems,
} from "@/src/modules/finance/lib/wallet-stack";
import { Button } from "@/src/shared/components/ui/button";
import { cn } from "@/src/shared/lib/utils";
import { motion } from "framer-motion";
import {
  Building2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CreditCardIcon,
} from "lucide-react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";

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
  productSummary: string
  balanceLabel: string
  balanceAmount: string
}

function toWalletCard(
  item: InstitutionStackItem,
  display: FinanceMoneyDisplay,
): WalletCardModel {
  if (item.kind === "institution") {
    return {
      item,
      name: item.institution.name,
      monogram: institutionInitials(item.institution.name),
      logoUrl: item.institution.logoUrl,
      color: item.institution.color ?? FALLBACK_INSTITUTION_COLOR,
      productSummary: formatProductCounts(item.counts),
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
    productSummary: "Cuenta de dinero en efectivo",
    balanceLabel: "Saldo",
    balanceAmount: formatStackItemBalance(item, display),
  }
}

function walletItemName(
  item: InstitutionStackItem,
  display: FinanceMoneyDisplay,
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
  const [cycleOffset, setCycleOffset] = useState(() => initialCycleOffset(items))

  useEffect(() => {
    if (items.length === 0) return
    const key = readFrontItemKey()
    const next = cycleOffsetForFrontKey(items, key)
    setCycleOffset(next)
    const front = items[next]
    if (front && (!key || stackItemKey(front) !== key)) {
      writeFrontItemKey(stackItemKey(front))
    }
  }, [items])

  if (items.length === 0) return null

  const frontIndex = walletFrontIndex(cycleOffset, items.length)
  const position = walletPositionLabel(cycleOffset, items.length)
  const visible = walletVisibleItems(items, cycleOffset, WALLET_VISIBLE_COUNT)
    .map((item) => toWalletCard(item, display))
  const showCycleChrome = items.length > 1
  const frontItem = items[frontIndex]

  const persistFront = (nextOffset: number) => {
    const nextFront = items[walletFrontIndex(nextOffset, items.length)]
    if (nextFront) writeFrontItemKey(stackItemKey(nextFront))
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
    if (!showCycleChrome) return
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
      if (event.target !== event.currentTarget) return
      event.preventDefault()
      if (frontItem) onSelect(frontItem)
    }
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <div
        className="relative outline-none h-100 focus-visible:ring-3 focus-visible:ring-ring/50"
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
              className="absolute top-0 left-0 right-8"
              initial={false}
              animate={{ x, y, rotate, scale, opacity, zIndex: 30 - pos }}
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
                productSummary={card.productSummary}
                balanceLabel={card.balanceLabel}
                balanceAmount={card.balanceAmount}
                isFront={isFront}
                onCycle={() => cycleBy(1)}
                onPress={() => onSelect(card.item)}
              />
            </motion.div>
          )
        })}
      </div>

      {showCycleChrome ? (
        <div className="flex flex-col gap-2 items-center px-2">
          <div className="flex gap-2 items-center">
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
                      "rounded-full transition-colors size-2",
                      isFront ? "bg-foreground" : "bg-muted-foreground/40",
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
  productSummary: string
  balanceLabel: string
  balanceAmount: string
  isFront?: boolean
  onCycle?: () => void
  onPress?: () => void
}

function InstitutionWalletCard({
  kind,
  name,
  monogram,
  logoUrl,
  color,
  productSummary,
  balanceLabel,
  balanceAmount,
  isFront = true,
  onCycle,
  onPress,
}: InstitutionWalletCardProps) {
  const offsetYRef = useRef(resetWalletGestureOffset())
  const KindIcon = kind === "institution" ? Building2Icon : CreditCardIcon

  return (
    <motion.button
      type="button"
      drag={isFront ? "y" : false}
      dragConstraints={{ top: -180, bottom: 0 }}
      dragElastic={0.5}
      dragSnapToOrigin
      onPointerDown={() => {
        offsetYRef.current = resetWalletGestureOffset()
      }}
      onDrag={(_event, info) => {
        offsetYRef.current = info.offset.y
      }}
      onDragEnd={(_event, info) => {
        offsetYRef.current = info.offset.y
        if (classifyWalletGesture(info.offset.y) === "cycle") {
          onCycle?.()
        }
      }}
      whileTap={{ scale: 0.985 }}
      onClick={() => {
        if (classifyWalletGesture(offsetYRef.current) === "press") {
          onPress?.()
        }
      }}
      className="flex relative flex-col justify-between p-6 w-full h-72 text-left rounded-3xl cursor-pointer"
      style={{ backgroundColor: color }}
    >
      <div className="flex justify-between items-start">
        <BrandLogo name={name || monogram} logoUrl={logoUrl} size={44} />
        <KindIcon
          className="size-5"
          style={{ color: "rgba(255,255,255,0.6)" }}
        />
      </div>

      <div className="flex flex-col flex-1 justify-center">
        <h3 className="text-3xl font-bold leading-tight text-white font-display">
          {name}
        </h3>
        <p className="mt-2 text-sm text-white/70">{productSummary}</p>
      </div>

      {isFront ? (
        <div
          className="flex absolute inset-x-6 justify-between"
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

      <div className="flex flex-col">
        <span className="text-xs tracking-wider uppercase text-white/60">
          {balanceLabel}:
        </span>
        <span className="font-mono text-2xl font-semibold tabular-nums text-right text-white">
          {balanceAmount}
        </span>
      </div>
    </motion.button>
  )
}
