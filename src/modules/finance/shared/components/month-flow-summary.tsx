"use client"

import { Money } from "@/src/modules/finance/shared/components/money"
import {
  parseFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import { BanknoteArrowDownIcon, BanknoteArrowUpIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const AMOUNT_COUNT_MS = 640

type FlowAmounts = {
  income: number | null
  expenses: number | null
}

type MonthFlowSummaryProps = {
  income: string | number | null | undefined
  expenses: string | number | null | undefined
  display: FinanceMoneyDisplay
  /** While the summary loads, both amounts show an ellipsis. */
  pending?: boolean
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function useCountedFlow(income: number | null, expenses: number | null) {
  const [amounts, setAmounts] = useState<FlowAmounts>({ income, expenses })
  const amountsRef = useRef(amounts)
  const frame = useRef(0)
  const skip = useRef(true)

  useEffect(() => {
    const from = amountsRef.current
    const firstRender = skip.current
    skip.current = false
    const reset = (next: FlowAmounts) => {
      cancelAnimationFrame(frame.current)
      amountsRef.current = next
      setAmounts(next)
    }
    if (
      firstRender ||
      income === null ||
      expenses === null ||
      from.income === null ||
      from.expenses === null ||
      prefersReducedMotion()
    ) {
      reset({ income, expenses })
      return
    }

    const startIncome = from.income
    const startExpenses = from.expenses
    const targetIncome = income
    const targetExpenses = expenses
    const started = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - started) / AMOUNT_COUNT_MS)
      const eased = easeOutCubic(t)
      const next = {
        income: startIncome + (targetIncome - startIncome) * eased,
        expenses: startExpenses + (targetExpenses - startExpenses) * eased,
      }
      amountsRef.current = next
      setAmounts(next)
      if (t < 1) {
        frame.current = requestAnimationFrame(step)
        return
      }
      amountsRef.current = { income: targetIncome, expenses: targetExpenses }
      setAmounts({ income: targetIncome, expenses: targetExpenses })
    }

    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame.current)
  }, [income, expenses])

  return amounts
}

function negateMoney(value: number | null) {
  if (value === null) {
    return null
  }
  return -value
}

/**
 * Income and expenses of the month as a pair of tiles. Home and Movements show
 * the same block, so both read the same amounts with the same sign and color.
 */
export function MonthFlowSummary({
  income,
  expenses,
  display,
  pending = false,
}: MonthFlowSummaryProps) {
  const shown = useCountedFlow(
    pending ? null : parseFinanceMoney(income),
    pending ? null : parseFinanceMoney(expenses)
  )

  return (
    <div className="grid grid-cols-2 gap-2">
      <div
        aria-label="Ingresos del mes"
        className="relative flex items-center justify-start rounded-2xl border border-border bg-card px-3 py-2"
      >
        <div className="flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">Ingresos</p>
          <p className="text-sm font-semibold tabular-nums">
            {pending ? (
              "…"
            ) : (
              <Money
                value={shown.income}
                display={display}
                showSign
                tone="auto"
              />
            )}
          </p>
        </div>
        <BanknoteArrowUpIcon
          className="absolute top-1/2 right-2 size-4 -translate-y-1/2 text-success"
          aria-hidden="true"
        />
      </div>
      <div
        aria-label="Gastos del mes"
        className="relative flex items-center justify-end rounded-2xl border border-border bg-card px-3 py-2 text-right"
      >
        <BanknoteArrowDownIcon
          className="absolute top-1/2 left-2 size-4 -translate-y-1/2 text-destructive"
          aria-hidden="true"
        />
        <div className="flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">Gastos</p>
          <p className="text-sm font-semibold tabular-nums">
            {pending ? (
              "…"
            ) : (
              <Money
                value={negateMoney(shown.expenses)}
                display={display}
                showSign
                tone="auto"
              />
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
