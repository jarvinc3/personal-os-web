"use client"

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
  classifyWalletGesture,
  resetWalletGestureOffset,
} from "@/src/modules/finance/lib/wallet-gesture";
import { cn } from "@/src/shared/lib/utils";
import { motion } from "framer-motion";
import { Building2Icon } from "lucide-react";
import { useRef, useState } from "react";

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
    color: item.account.color ?? FALLBACK_CASH_COLOR,
    productSummary: "Efectivo sin institución",
    balanceLabel: "Saldo",
    balanceAmount: formatStackItemBalance(item, display),
  }
}

export function InstitutionSwapStack({
  items,
  display,
  onSelect,
  className,
}: InstitutionSwapStackProps) {
  const [cycleOffset, setCycleOffset] = useState(0)

  if (items.length === 0) return null

  const safeOffset = ((cycleOffset % items.length) + items.length) % items.length
  const ordered = [
    ...items.slice(safeOffset),
    ...items.slice(0, safeOffset),
  ]
  const visibleCount = Math.min(3, ordered.length)
  const visible = ordered
    .slice(0, visibleCount)
    .map((item) => toWalletCard(item, display))

  const cycle = () => setCycleOffset((current) => current + 1)

  return (
    <div className={cn("relative h-110", className)}>
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
            animate={{ x, y, rotate, scale, opacity, zIndex: 30 - pos }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            style={{
              transformOrigin: "bottom center",
              pointerEvents: isFront ? "auto" : "none",
            }}
          >
            <InstitutionWalletCard
              name={card.name}
              monogram={card.monogram}
              color={card.color}
              productSummary={card.productSummary}
              balanceLabel={card.balanceLabel}
              balanceAmount={card.balanceAmount}
              isFront={isFront}
              onCycle={cycle}
              onPress={() => onSelect(card.item)}
            />
          </motion.div>
        )
      })}
    </div>
  )
}

type InstitutionWalletCardProps = {
  name: string
  monogram: string
  color: string
  productSummary: string
  balanceLabel: string
  balanceAmount: string
  isFront?: boolean
  onCycle?: () => void
  onPress?: () => void
}

function InstitutionWalletCard({
  name,
  monogram,
  color,
  productSummary,
  balanceLabel,
  balanceAmount,
  isFront = true,
  onCycle,
  onPress,
}: InstitutionWalletCardProps) {
  const offsetYRef = useRef(resetWalletGestureOffset())

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
      className="relative flex h-95 w-full cursor-pointer flex-col justify-between rounded-3xl p-6 text-left"
      style={{ backgroundColor: color }}
    >
      <div className="flex items-start justify-between">
        <span
          className="rounded-xl px-3 py-1.5 font-display text-base font-bold text-white"
          style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
        >
          {monogram}
        </span>
        <Building2Icon
          className="size-5"
          style={{ color: "rgba(255,255,255,0.6)" }}
        />
      </div>

      <div className="flex flex-1 flex-col justify-center">
        <h3 className="font-display text-3xl font-bold leading-tight text-white">
          {name}
        </h3>
        <p className="mt-2 text-sm text-white/70">{productSummary}</p>
      </div>

      {isFront ? (
        <div
          className="absolute inset-x-6 flex justify-between"
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

      <div className="flex items-end justify-between gap-3">
        <span className="text-[11px] tracking-wider text-white/60 uppercase">
          {balanceLabel}
        </span>
        <span className="font-mono text-2xl font-semibold text-white tabular-nums">
          {balanceAmount}
        </span>
      </div>
    </motion.button>
  )
}
