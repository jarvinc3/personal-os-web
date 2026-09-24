"use client"

import type { FinanceMoneyDisplay } from "@/src/modules/finance/lib/money";
import { formatFinanceMoney } from "@/src/modules/finance/lib/money";
import { BanknoteArrowDownIcon, BanknoteArrowUpIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type FinanceFlowPillsProps = {
  income: number
  expenses: number
  display: FinanceMoneyDisplay
}

type Amounts = {
  income: number
  expenses: number
}

const AMOUNT_COUNT_MS = 640

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function useCountedAmounts(income: number, expenses: number) {
  const [amounts, setAmounts] = useState<Amounts>({ income, expenses })
  const amountsRef = useRef(amounts)
  const frame = useRef(0)
  const skip = useRef(true)

  useEffect(() => {
    if (skip.current) {
      skip.current = false
      amountsRef.current = { income, expenses }
      setAmounts({ income, expenses })
      return
    }

    const from = amountsRef.current
    const unchanged = from.income === income && from.expenses === expenses
    if (unchanged || prefersReducedMotion()) {
      cancelAnimationFrame(frame.current)
      amountsRef.current = { income, expenses }
      setAmounts({ income, expenses })
      return
    }

    const started = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - started) / AMOUNT_COUNT_MS)
      const eased = easeOutCubic(t)
      const next = {
        income: from.income + (income - from.income) * eased,
        expenses: from.expenses + (expenses - from.expenses) * eased,
      }
      amountsRef.current = next
      setAmounts(next)
      if (t < 1) {
        frame.current = requestAnimationFrame(step)
        return
      }
      amountsRef.current = { income, expenses }
      setAmounts({ income, expenses })
    }

    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame.current)
  }, [income, expenses])

  return amounts
}

export function FinanceFlowPills({
  income,
  expenses,
  display,
}: FinanceFlowPillsProps) {
  const shown = useCountedAmounts(income, expenses)

  return (
    <div className="grid grid-cols-2 gap-2">
      <div
        aria-label="Ingresos del mes"
        className="flex justify-between items-center px-3 py-2 rounded-2xl border border-border bg-card"
      >
        <div className="flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">Ingresos</p>
          <p className="text-sm font-semibold tabular-nums text-success">
            + {formatFinanceMoney(shown.income, display)}
          </p>
        </div>
        <BanknoteArrowUpIcon className="size-4 text-success" />
      </div>
      <div
        aria-label="Gastos del mes"
        className="flex justify-between items-center px-3 py-2 text-right rounded-2xl border border-border bg-card"
      >
        <BanknoteArrowDownIcon className="size-4 text-destructive" />
        <div className="flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">Gastos</p>
          <p className="text-sm font-semibold tabular-nums text-destructive">
            − {formatFinanceMoney(shown.expenses, display)}
          </p>
        </div>
      </div>
    </div>
  )
}
