"use client"

import { useReconciliationStatus } from "@/src/modules/finance/shared/hooks/use-reconciliations"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type { FinanceReconciliationStatusItem } from "@/src/modules/finance/shared/types/entities"
import { BanknoteIcon, ChevronRightIcon } from "lucide-react"
import Link from "next/link"
import { cn } from "@/src/shared/lib/utils"

const MAX_VISIBLE_PRODUCTS = 4
const CHIP_CLASS =
  "rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"

type ReconciliationMonthStatusProps = {
  enabled: boolean
  month: string
  monthLabel: string
  display: FinanceMoneyDisplay
  /** Product detail with its reconciliation sheet open, or null if missing. */
  hrefFor: (item: FinanceReconciliationStatusItem) => string | null
}

export function ReconciliationMonthStatus({
  enabled,
  month,
  monthLabel,
  display,
  hrefFor,
}: ReconciliationMonthStatusProps) {
  const query = useReconciliationStatus(enabled, month)
  const status = query.data
  const errorState = query.isError ? (
    <FinanceErrorState
      message={financeErrorMessage(query.error)}
      onRetry={() => void query.refetch()}
      isRetrying={query.isFetching}
    />
  ) : null

  if (query.isError && !status) {
    return errorState
  }

  if (!status || status.items.length === 0) {
    return null
  }

  const pending = status.items.filter((item) => !item.reconciled)
  if (pending.length === 0) {
    return null
  }

  const visible = pending.slice(0, MAX_VISIBLE_PRODUCTS)
  const hidden = pending.length - visible.length
  const firstHref = hrefFor(pending[0]!)
  const title = `${pending.length} producto${
    pending.length === 1 ? "" : "s"
  } sin conciliar en ${monthLabel}`
  const statusRow = (
    <>
      <BanknoteIcon className="size-4 shrink-0 text-muted-foreground" />
      <p className="flex-1 text-sm font-medium">{title}</p>
    </>
  )

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3">
      {firstHref ? (
        <Link
          href={firstHref}
          className="flex items-center gap-2 text-left"
          aria-label={`${title}. Abrir la conciliación`}
        >
          {statusRow}
          <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
        </Link>
      ) : (
        <div className="flex items-center gap-2">{statusRow}</div>
      )}
      {visible.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {visible.map((item) => {
            const label = `${item.name} · ${formatFinanceMoney(item.balance, {
              ...display,
              currency: item.currency,
            })}`
            const href = hrefFor(item)
            if (!href) {
              return (
                <span key={item.key} className={CHIP_CLASS}>
                  {label}
                </span>
              )
            }
            return (
              <Link
                key={item.key}
                href={href}
                className={cn(
                  CHIP_CLASS,
                  "transition-colors hover:bg-muted/70"
                )}
                aria-label={`Conciliar ${item.name}`}
              >
                {label}
              </Link>
            )
          })}
          {hidden > 0 ? (
            <span className={CHIP_CLASS}>+{hidden} más</span>
          ) : null}
        </div>
      ) : null}
      {errorState}
    </div>
  )
}
