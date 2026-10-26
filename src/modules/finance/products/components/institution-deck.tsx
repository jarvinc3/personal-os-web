"use client"

import { InstitutionWalletCard } from "@/src/modules/finance/products/components/institution-wallet-card"
import { buildInstitutionCard } from "@/src/modules/finance/products/lib/institution-card"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type { InstitutionStackItem } from "@/src/modules/finance/shared/lib/institution-stack"
import { stackItemKey } from "@/src/modules/finance/shared/lib/wallet-front-persistence"
import {
  WALLET_DRAGGING_Z_INDEX,
  walletCardMotion,
  walletFrontIndex,
  walletPositionLabel,
} from "@/src/modules/finance/shared/lib/wallet-stack"
import { motion, useReducedMotion } from "framer-motion"
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react"

type InstitutionDeckProps = {
  items: InstitutionStackItem[]
  display: FinanceMoneyDisplay
  cycleOffset: number
  /** Deployed row of cards; `false` keeps the stack. */
  deployed: boolean
  /** Extra spring travel right after a step crosses an end of the ring. */
  bouncing: boolean
  onCycle: (delta: number) => void
  onSelect: (item: InstitutionStackItem) => void
}

/**
 * The cards live here and only change position: stacking and deploying are two
 * layouts of the same elements, so nothing unmounts and the front card stays
 * where it is.
 */
export function InstitutionDeck({
  items,
  display,
  cycleOffset,
  deployed,
  bouncing,
  onCycle,
  onSelect,
}: InstitutionDeckProps) {
  const deckRef = useRef<HTMLDivElement | null>(null)
  const [trackWidth, setTrackWidth] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isPending, startTransition] = useTransition()
  const prefersReducedMotion = useReducedMotion()
  const frontIndex = walletFrontIndex(cycleOffset, items.length)
  const position = walletPositionLabel(cycleOffset, items.length)
  const showCycleChrome = items.length > 1

  const measureDeck = useCallback((node: HTMLDivElement | null) => {
    deckRef.current = node
    if (node) {
      setTrackWidth(node.clientWidth)
    }
  }, [])

  useEffect(() => {
    const node = deckRef.current
    if (!node) {
      return
    }
    const observer = new ResizeObserver(() => setTrackWidth(node.clientWidth))
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  function openItem(item: InstitutionStackItem) {
    startTransition(() => onSelect(item))
  }

  function onDeckKeyDown(event: KeyboardEvent<HTMLDivElement>) {
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
      const frontItem = items[frontIndex]
      if (frontItem) {
        openItem(frontItem)
      }
    }
  }

  return (
    <div
      ref={measureDeck}
      className="relative h-80 overflow-hidden"
      data-sidebar-swipe-ignore=""
      tabIndex={showCycleChrome ? 0 : undefined}
      role={showCycleChrome ? "group" : undefined}
      aria-label={
        showCycleChrome
          ? `Cartera de instituciones, ${position.current} de ${position.total}`
          : undefined
      }
      onKeyDown={onDeckKeyDown}
    >
      {trackWidth > 0
        ? items.map((item, index) => {
            const cardMotion = walletCardMotion({
              deployed,
              index,
              frontIndex,
              total: items.length,
              trackWidth,
            })
            const isFront = index === frontIndex
            return (
              <motion.div
                key={stackItemKey(item)}
                className="absolute top-0 left-4 w-[calc(100%-2rem)]"
                initial={false}
                animate={{
                  x: cardMotion.x,
                  y: cardMotion.y,
                  rotate: cardMotion.rotate,
                  scale: cardMotion.scale,
                  opacity: cardMotion.opacity,
                  zIndex:
                    isFront && isDragging
                      ? WALLET_DRAGGING_Z_INDEX
                      : cardMotion.zIndex,
                }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : {
                        type: "spring",
                        stiffness: 320,
                        damping: bouncing ? 17 : 30,
                      }
                }
                style={{
                  transformOrigin: "bottom center",
                  pointerEvents: cardMotion.interactive ? "auto" : "none",
                }}
              >
                <InstitutionWalletCard
                  card={buildInstitutionCard(item, display)}
                  isFront={isFront}
                  isPending={isFront && isPending}
                  onDragActiveChange={isFront ? setIsDragging : undefined}
                  onCycle={isFront ? onCycle : undefined}
                  onPress={
                    cardMotion.interactive ? () => openItem(item) : undefined
                  }
                />
              </motion.div>
            )
          })
        : null}
    </div>
  )
}
