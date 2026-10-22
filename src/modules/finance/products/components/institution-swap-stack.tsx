"use client"

import { InstitutionCarousel } from "@/src/modules/finance/products/components/institution-carousel"
import { InstitutionPile } from "@/src/modules/finance/products/components/institution-pile"
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
import { GalleryHorizontalIcon, LayersIcon } from "lucide-react"
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
  const showToggle = items.length > 1

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

  const isCarousel = view === "carousel"

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {showToggle ? (
        <div className="flex items-center justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-expanded={isCarousel}
            onClick={toggleView}
          >
            {isCarousel ? (
              <LayersIcon className="size-4 shrink-0" />
            ) : (
              <GalleryHorizontalIcon className="size-4 shrink-0" />
            )}
            {isCarousel ? "Apilar" : "Desplegar"}
          </Button>
        </div>
      ) : null}

      {isCarousel ? (
        <div className="min-h-80">
          <InstitutionCarousel
            items={items}
            display={display}
            activeIndex={frontIndex}
            onSelect={onSelect}
          />
        </div>
      ) : (
        <InstitutionPile
          items={items}
          display={display}
          cycleOffset={cycleOffset}
          bouncing={bouncing}
          onCycle={cycleBy}
          onShowItem={showItemAt}
          onSelect={onSelect}
        />
      )}
    </div>
  )
}
