"use client"

import { InstitutionDeck } from "@/src/modules/finance/products/components/institution-deck"
import { institutionCardName } from "@/src/modules/finance/products/lib/institution-card"
import {
  readInstitutionView,
  writeInstitutionView,
  type InstitutionView,
} from "@/src/modules/finance/products/lib/institution-view"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type { InstitutionStackItem } from "@/src/modules/finance/shared/lib/institution-stack"
import {
  cycleOffsetForFrontKey,
  readFrontItemKey,
  stackItemKey,
  writeFrontItemKey,
} from "@/src/modules/finance/shared/lib/wallet-front-persistence"
import {
  walletFrontIndex,
  walletWrapDirection,
} from "@/src/modules/finance/shared/lib/wallet-stack"
import { Button } from "@/src/shared/components/ui/button"
import { cn } from "@/src/shared/lib/utils"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  GalleryHorizontalIcon,
  LayersIcon,
} from "lucide-react"
import { useState } from "react"

type InstitutionSwapStackProps = {
  items: InstitutionStackItem[]
  display: FinanceMoneyDisplay
  onSelect: (item: InstitutionStackItem) => void
  className?: string
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
  const [view, setView] = useState<InstitutionView>(() => readInstitutionView())
  const [cycleOffset, setCycleOffset] = useState(() =>
    initialCycleOffset(items)
  )
  const [bouncing, setBouncing] = useState(false)
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
  const showCycleChrome = items.length > 1
  const isDeployed = view === "carousel"

  function persistFront(nextOffset: number) {
    const nextFront = items[walletFrontIndex(nextOffset, items.length)]
    if (nextFront) {
      writeFrontItemKey(stackItemKey(nextFront))
    }
  }

  function cycleBy(delta: number) {
    const next = cycleOffset + delta
    // Only the step that crosses an end of the ring bounces.
    setBouncing(walletWrapDirection(cycleOffset, delta, items.length) !== null)
    setCycleOffset(next)
    persistFront(next)
  }

  function showItemAt(index: number) {
    setBouncing(false)
    setCycleOffset(index)
    persistFront(index)
  }

  function toggleView() {
    const next: InstitutionView = view === "stacked" ? "carousel" : "stacked"
    writeInstitutionView(next)
    setView(next)
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {showCycleChrome ? (
        <div className="flex items-center justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-expanded={isDeployed}
            onClick={toggleView}
          >
            {isDeployed ? (
              <LayersIcon className="size-4 shrink-0" />
            ) : (
              <GalleryHorizontalIcon className="size-4 shrink-0" />
            )}
            {isDeployed ? "Apilar" : "Desplegar"}
          </Button>
        </div>
      ) : null}

      <InstitutionDeck
        items={items}
        display={display}
        cycleOffset={cycleOffset}
        deployed={isDeployed}
        bouncing={bouncing}
        onCycle={cycleBy}
        onSelect={onSelect}
      />

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
