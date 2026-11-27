"use client"

import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { showUndoToast } from "@/src/modules/finance/shared/components/undo-toast"
import type { ReconciliationTarget } from "@/src/modules/finance/shared/hooks/use-reconciliations"
import {
  useDeleteReconciliation,
  useReconciliations,
  useRestoreReconciliation,
} from "@/src/modules/finance/shared/hooks/use-reconciliations"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"
import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import { FINANCE_RECONCILIATION_KIND_LABEL } from "@/src/modules/finance/shared/types/entities"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { InfiniteListSentinel } from "@/src/shared/components/feedback/infinite-list-sentinel"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/src/shared/components/ui/item"
import { cn } from "@/src/shared/lib/utils"
import { appToast } from "@/src/shared/lib/app-toast"
import { ScaleIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/src/shared/components/ui/button"
import { Skeleton } from "@/src/shared/components/ui/skeleton"

type ReconciliationsSectionProps = {
  enabled: boolean
  target: ReconciliationTarget
  display: FinanceMoneyDisplay
}

export function ReconciliationsSection({
  enabled,
  target,
  display,
}: ReconciliationsSectionProps) {
  const query = useReconciliations(enabled, target)
  const deleteMutation = useDeleteReconciliation()
  const restoreMutation = useRestoreReconciliation()
  const items = infiniteListItems(query.data)

  async function onDelete(id: string) {
    try {
      await deleteMutation.mutateAsync(id)
      showUndoToast("Conciliación borrada", () =>
        restoreMutation.mutate(id, {
          onError: (error) =>
            appToast.error({ text1: financeErrorMessage(error) }),
        })
      )
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-3xl bg-background">
      <h2 className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Conciliaciones
      </h2>
      {query.isError ? (
        <ErrorState
          message={financeErrorMessage(query.error)}
          onRetry={() => void query.refetch()}
          isRetrying={query.isFetching}
        />
      ) : null}
      <AsyncRegion
        pending={query.isPending && !query.data}
        pendingFallback={
          <div className="flex flex-col gap-2 px-3 py-2" aria-hidden>
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        }
        empty={items.length === 0}
        emptyFallback={
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ScaleIcon />
              </EmptyMedia>
              <EmptyTitle>Sin conciliaciones</EmptyTitle>
              <EmptyDescription>
                Cierra la cuenta contra el saldo del banco para ver el
                historial.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        }
      >
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {items.map((item, index) => (
            <Item
              key={item.id}
              variant="plain"
              className={cn(
                "px-3",
                index !== items.length - 1 && "border-b border-border/60"
              )}
            >
              <ItemMedia variant="icon">
                <ScaleIcon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  {formatFinanceMoney(item.realBalance, {
                    ...display,
                    currency: item.currency,
                  })}
                </ItemTitle>
                <ItemDescription className="truncate text-xs">
                  {`${formatCalendarDate(item.asOfDate, display.locale)} · ${
                    item.adjustments.length === 0
                      ? "Sin ajustes"
                      : item.adjustments
                          .map(
                            (adjustment) =>
                              FINANCE_RECONCILIATION_KIND_LABEL[adjustment.kind]
                          )
                          .join(", ")
                  }`}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <span className="text-sm font-semibold tabular-nums">
                  {formatFinanceMoney(item.difference, {
                    ...display,
                    currency: item.currency,
                    leadingSign: true,
                  })}
                </span>
                {index === 0 ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Borrar conciliación"
                    disabled={deleteMutation.isPending}
                    onClick={() => void onDelete(item.id)}
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                ) : null}
              </ItemActions>
            </Item>
          ))}
        </div>
        <InfiniteListSentinel
          hasNextPage={query.hasNextPage}
          isFetchingNextPage={query.isFetchingNextPage}
          onLoadMore={() => void query.fetchNextPage()}
        />
      </AsyncRegion>
    </section>
  )
}
