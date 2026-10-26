"use client"

import type { InstitutionStackItem } from "@/src/modules/finance/shared/lib/institution-stack"
import type { FinanceBalanceSheetCurrencyGroup } from "@/src/modules/finance/shared/types/entities"
import {
  formatCompactFinanceAmount,
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import {
  buildRingStackSlices,
  hasDrawableRingBalance,
} from "@/src/modules/finance/shared/lib/ring-stack"
import {
  currencyGroupFor,
  currencyWithBalance,
  receivablesLine,
} from "@/src/modules/finance/products/lib/currency-summary"
import { SegmentedControl } from "@/src/shared/components/forms/segmented-control"
import { GlossaryHelpButton } from "@/src/modules/help"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  FinanceRingChart,
  FinanceRingLegend,
} from "@/src/modules/finance/products/components/ring-chart"

/** The ring groups and the legend rows own the selection; anywhere else clears it. */
const SELECTION_TARGET_SELECTOR = "button, [role='button']"

const HERO_LABEL_CLASS =
  "text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase"

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
  netWorthHref: string
  currencyTotals: readonly FinanceBalanceSheetCurrencyGroup[]
}

export function FinanceHeroSection({
  items,
  display,
  isPending,
  hasData,
  netWorth,
  netWorthComplete,
  netWorthHref,
  currencyTotals,
}: FinanceHeroSectionProps) {
  const [pickedCurrency, setPickedCurrency] = useState<string | null>(null)
  const [activeKey, setActiveKey] = useState<string | null>(null)
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

  // The base currency unless it has nothing to graph: then the first one that does.
  const defaultCurrency =
    currencyWithBalance(currencyTotals, display.currency) ?? display.currency
  const activeCurrency = pickedCurrency ?? defaultCurrency
  const activeGroup = currencyGroupFor(currencyTotals, activeCurrency)
  const activeReceivables = activeGroup
    ? receivablesLine(activeGroup, display)
    : null
  const slices = buildRingStackSlices(items, display, activeCurrency)
  const hasChart = hasDrawableRingBalance(slices)
  const activeSlice = slices.find((slice) => slice.key === activeKey) ?? null

  const signedDisplay = { ...display, leadingSign: true }
  const totalAmount = activeGroup?.totals.netWorth ?? netWorth
  const netWorthFallback = (() => {
    if (isPending && !hasData) {
      return "…"
    }
    if (!netWorthComplete) {
      return hasData ? "Balance incompleto" : "—"
    }
    return formatFinanceMoney(totalAmount, {
      ...signedDisplay,
      currency: activeCurrency,
    })
  })()
  const compactTotal = (() => {
    if (isPending && !hasData) {
      return "…"
    }
    if (!netWorthComplete) {
      return "—"
    }
    return formatCompactFinanceAmount(totalAmount, display.locale)
  })()

  const centerLabel = activeSlice ? activeSlice.name : "Total"
  const centerValue = activeSlice
    ? formatCompactFinanceAmount(activeSlice.signedValue, display.locale)
    : compactTotal
  const centerDebt = activeSlice?.debtLabel ?? null

  const onlyCurrency = currencyTotals.length === 1 ? currencyTotals[0] : null
  const showsCurrencyCards =
    currencyTotals.length > 1 ||
    (onlyCurrency !== null &&
      onlyCurrency.currency.trim().toUpperCase() !==
        display.currency.trim().toUpperCase())

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 px-2">
        <div className="flex items-center gap-1">
          <p className={HERO_LABEL_CLASS}>Patrimonio neto</p>
          <GlossaryHelpButton slug="patrimonio" />
        </div>
        {currencyTotals.length > 1 ? (
          <SegmentedControl
            label="Moneda del anillo"
            value={activeCurrency}
            onChange={setPickedCurrency}
            options={currencyTotals.map((group) => ({
              value: group.currency,
              label: group.currency,
            }))}
          />
        ) : null}
      </div>

      {hasChart ? (
        <div className="flex flex-col gap-2">
          <div ref={heroRef} className="flex items-center gap-3 px-2 sm:gap-6">
            <FinanceRingChart
              slices={slices}
              activeKey={activeKey}
              onSelect={toggleSlice}
              centerLabel={centerLabel}
              centerValue={centerValue}
              centerDebt={centerDebt}
              centerHref={netWorthHref}
              className="w-2/5 shrink-0 sm:w-44"
            />
            <FinanceRingLegend
              slices={slices}
              activeKey={activeKey}
              onSelect={toggleSlice}
              className="min-w-0 flex-1"
            />
          </div>
          {netWorthComplete ? null : (
            <p className="px-2 text-xs text-muted-foreground">
              Balance incompleto
            </p>
          )}
          {activeReceivables ? (
            <span className="flex items-center gap-1 px-2 text-xs text-muted-foreground">
              Por cobrar
              <span className="tabular-nums">{activeReceivables}</span>
              <GlossaryHelpButton slug="por-cobrar" />
            </span>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 px-2 pb-2">
          <Link
            href={netWorthHref}
            aria-label="Ver desglose del patrimonio"
            className="rounded-md text-3xl font-bold tracking-tight text-foreground tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {netWorthFallback}
          </Link>
          {slices.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              Sin saldos para graficar
            </p>
          ) : null}
          {activeReceivables ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              Por cobrar
              <span className="tabular-nums">{activeReceivables}</span>
              <GlossaryHelpButton slug="por-cobrar" />
            </span>
          ) : null}
        </div>
      )}

      {showsCurrencyCards ? (
        <div className="flex flex-col gap-2 px-2 pb-2">
          <p className={HERO_LABEL_CLASS}>Por moneda</p>
          <div className="grid grid-cols-2 gap-2">
            {currencyTotals.map((group) => {
              const receivables = receivablesLine(group, display)
              const groupTotal =
                group.totals.netWorth === null
                  ? "Balance incompleto"
                  : formatFinanceMoney(group.totals.netWorth, {
                      ...display,
                      currency: group.currency,
                      leadingSign: true,
                    })
              return (
                <div
                  key={group.currency}
                  className="flex flex-col gap-1 rounded-2xl border border-border bg-card px-3 py-2"
                >
                  <span className="text-xs text-muted-foreground">
                    {group.currency}
                  </span>
                  <Link
                    href={netWorthHref}
                    aria-label={`Ver el desglose del patrimonio en ${group.currency}`}
                    className="rounded-md text-xl font-bold tracking-tight tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {groupTotal}
                  </Link>
                  {receivables ? (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      Por cobrar
                      <span className="tabular-nums">{receivables}</span>
                      <GlossaryHelpButton slug="por-cobrar" />
                    </span>
                  ) : null}
                </div>
              )
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            {currencyTotals.length > 1
              ? "Cada moneda va por separado; no se convierten entre sí."
              : `Se muestra en ${onlyCurrency?.currency}, sin convertir a ${display.currency}.`}
          </p>
        </div>
      ) : null}
    </div>
  )
}
