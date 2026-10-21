"use client"

import type { InstitutionStackItem } from "@/src/modules/finance/shared/lib/institution-stack"
import {
  formatCompactFinanceAmount,
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import {
  buildRingStackSlices,
  hasDrawableRingBalance,
} from "@/src/modules/finance/shared/lib/ring-stack"
import { useEffect, useRef, useState } from "react"
import {
  FinanceRingChart,
  FinanceRingLegend,
} from "@/src/modules/finance/products/components/ring-chart"

/** The ring groups and the legend rows own the selection; anywhere else clears it. */
const SELECTION_TARGET_SELECTOR = "button, [role='button']"

/** True only when the click landed on a ring or on a legend row. */
function ownsSelection(
  root: HTMLElement | null,
  target: EventTarget | null
): boolean {
  if (!root || !(target instanceof Element)) {
    return false
  }
  return (
    root.contains(target) && target.closest(SELECTION_TARGET_SELECTOR) !== null
  )
}

type FinanceHeroSectionProps = {
  items: InstitutionStackItem[]
  display: FinanceMoneyDisplay
  isPending: boolean
  hasData: boolean
  netWorth: string | null
  netWorthComplete: boolean
}

export function FinanceHeroSection({
  items,
  display,
  isPending,
  hasData,
  netWorth,
  netWorthComplete,
}: FinanceHeroSectionProps) {
  const slices = buildRingStackSlices(items, display)
  const hasChart = hasDrawableRingBalance(slices)
  const [activeKey, setActiveKey] = useState<string | null>(null)

  const activeSlice = slices.find((slice) => slice.key === activeKey) ?? null
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // On `click` rather than `pointerdown`: scrolling the page with a finger
    // starts with a pointerdown and would drop the selection on every swipe.
    function onClick(event: MouseEvent) {
      if (ownsSelection(heroRef.current, event.target)) {
        return
      }
      setActiveKey(null)
    }
    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  }, [])

  const toggleSlice = (key: string) => {
    setActiveKey((current) => (current === key ? null : key))
  }

  const signedDisplay = { ...display, leadingSign: true }

  const netWorthFallback = (() => {
    if (isPending && !hasData) {
      return "…"
    }
    if (netWorthComplete) {
      return formatFinanceMoney(netWorth, signedDisplay)
    }
    return hasData ? "Balance incompleto" : "—"
  })()
  const compactNetWorthFallback = (() => {
    if (isPending && !hasData) {
      return "…"
    }
    if (netWorthComplete) {
      return formatCompactFinanceAmount(netWorth, display.locale)
    }
    return "—"
  })()

  const centerLabel = activeSlice ? activeSlice.name : "Total"
  const centerValue = activeSlice
    ? formatCompactFinanceAmount(activeSlice.signedValue, display.locale)
    : compactNetWorthFallback
  const centerDebt = activeSlice?.debtLabel ?? null

  if (!hasChart) {
    return (
      <div className="flex flex-col items-center gap-1 px-2 pb-2">
        <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
          Balance total
        </p>
        <p className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
          {netWorthFallback}
        </p>
        {slices.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            Sin saldos para graficar
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div ref={heroRef} className="flex items-center gap-3 pt-4 sm:gap-6">
      <FinanceRingChart
        slices={slices}
        activeKey={activeKey}
        onSelect={toggleSlice}
        centerLabel={centerLabel}
        centerValue={centerValue}
        centerDebt={centerDebt}
        className="w-2/5 shrink-0 sm:w-44"
      />
      <FinanceRingLegend
        slices={slices}
        activeKey={activeKey}
        onSelect={toggleSlice}
        className="min-w-0 flex-1"
      />
    </div>
  )
}
