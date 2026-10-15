"use client"

import { useReconciliationStatus } from "@/src/modules/finance/shared/hooks/use-reconciliations"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { BanknoteIcon, CheckIcon } from "lucide-react"

type ReconciliationMonthStatusProps = {
  enabled: boolean
  month: string
  monthLabel: string
  display: FinanceMoneyDisplay
}

export function ReconciliationMonthStatus({
  enabled,
  month,
  monthLabel,
  display,
}: ReconciliationMonthStatusProps) {
  const query = useReconciliationStatus(enabled, month)
  const status = query.data

  if (!status || status.items.length === 0) {
    return null
  }

  const pending = status.items.filter((item) => !item.reconciled)

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        {status.pendingCount === 0 ? (
          <CheckIcon className="size-4 text-[var(--success)]" />
        ) : (
          <BanknoteIcon className="size-4 text-muted-foreground" />
        )}
        <p className="text-sm font-medium">
          {status.pendingCount === 0
            ? `Todo conciliado en ${monthLabel}`
            : `${status.pendingCount} producto${
                status.pendingCount === 1 ? "" : "s"
              } sin conciliar en ${monthLabel}`}
        </p>
      </div>
      {pending.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {pending.slice(0, 4).map((item) => (
            <span
              key={item.key}
              className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
            >
              {item.name} ·{" "}
              {formatFinanceMoney(item.balance, {
                ...display,
                currency: item.currency,
              })}
            </span>
          ))}
        </div>
      ) : null}
      {query.isError ? (
        <FinanceErrorState
          message={financeErrorMessage(query.error)}
          onRetry={() => void query.refetch()}
          isRetrying={query.isFetching}
        />
      ) : null}
    </div>
  )
}
