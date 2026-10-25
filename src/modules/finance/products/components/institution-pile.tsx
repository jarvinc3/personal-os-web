"use client"

import { InstitutionWalletCard } from "@/src/modules/finance/products/components/institution-wallet-card"
import {
  buildInstitutionCard,
  institutionCardName,
} from "@/src/modules/finance/products/lib/institution-card"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type { InstitutionStackItem } from "@/src/modules/finance/shared/lib/institution-stack"
import { stackItemKey } from "@/src/modules/finance/shared/lib/wallet-front-persistence"
import {
  WALLET_VISIBLE_COUNT,
  walletFrontIndex,
  walletPositionLabel,
  walletVisibleItems,
} from "@/src/modules/finance/shared/lib/wallet-stack"
import { Button } from "@/src/shared/components/ui/button"
import { cn } from "@/src/shared/lib/utils"
import { motion } from "framer-motion"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { type KeyboardEvent, useState, useTransition } from "react"

type InstitutionPileProps = {
  items: InstitutionStackItem[]
  display: FinanceMoneyDisplay
  cycleOffset: number
  bouncing: boolean
  onCycle: (delta: number) => void
  onShowItem: (index: number) => void
  onSelect: (item: InstitutionStackItem) => void
}

export function InstitutionPile({
  items,
  display,
  cycleOffset,
  bouncing,
  onCycle,
  onShowItem,
  onSelect,
}: InstitutionPileProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isPending, startTransition] = useTransition()
  const frontIndex = walletFrontIndex(cycleOffset, items.length)
  const position = walletPositionLabel(cycleOffset, items.length)
  const visible = walletVisibleItems(items, cycleOffset, WALLET_VISIBLE_COUNT)
  const showCycleChrome = items.length > 1
  const frontItem = items[frontIndex]

  function openItem(item: InstitutionStackItem) {
    startTransition(() => onSelect(item))
  }

  function onStackKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!showCycleChrome) {
      return
    }
    if (event.key === "ArrowRight") {
      event.preventDefault()
      onCycle(1)
      return
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      onCycle(-1)
      return
    }
    if (event.key === "Enter" || event.key === " ") {
      if (event.target !== event.currentTarget) {
        return
      }
      event.preventDefault()
      if (frontItem) {
        openItem(frontItem)
      }
    }
  }

  return (
    <div className="flex flex-col" data-sidebar-swipe-ignore="">
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
        {visible.map((item, pos) => {
          const isFront = pos === 0
          return (
            <motion.div
              key={stackItemKey(item)}
              className="absolute top-0 right-8 left-0"
              initial={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
              animate={{
                x: pos * 12,
                y: pos * 22,
                rotate: pos * 3.5,
                scale: 1 - pos * 0.05,
                opacity: 1 - pos * 0.15,
                zIndex: isFront && isDragging ? 80 : 30 - pos,
              }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: bouncing ? 17 : 30,
              }}
              style={{
                transformOrigin: "bottom center",
                pointerEvents: isFront ? "auto" : "none",
              }}
            >
              <InstitutionWalletCard
                card={buildInstitutionCard(item, display)}
                isFront={isFront}
                isPending={isFront && isPending}
                onDragActiveChange={isFront ? setIsDragging : undefined}
                onCycle={isFront ? onCycle : undefined}
                onPress={isFront ? () => openItem(item) : undefined}
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
              onClick={() => onCycle(-1)}
            >
              <ChevronLeftIcon />
            </Button>
            <div className="flex items-center gap-1.5">
              {items.map((item, index) => {
                const isFront = index === frontIndex
                return (
                  <button
                    key={stackItemKey(item)}
                    type="button"
                    aria-label={institutionCardName(item)}
                    aria-current={isFront ? "true" : undefined}
                    className={cn(
                      "size-2 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                      isFront ? "bg-foreground" : "bg-muted-foreground/40"
                    )}
                    onClick={() => onShowItem(index)}
                  />
                )
              })}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Siguiente institución"
              onClick={() => onCycle(1)}
            >
              <ChevronRightIcon />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
