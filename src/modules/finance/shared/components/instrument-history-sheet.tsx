"use client"

import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import {
  useInstrumentHistory,
  type InstrumentHistoryTarget,
} from "@/src/modules/finance/shared/hooks/use-instrument-history"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"
import {
  instrumentHistoryLabel,
  instrumentHistoryLimitTransition,
} from "@/src/modules/finance/shared/lib/instrument-history"
import { formatFinanceDateTimeLabel } from "@/src/modules/finance/shared/lib/ledger-form"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { InfiniteListSentinel } from "@/src/shared/components/ui/infinite-list-sentinel"
import { SummaryItem } from "@/src/shared/components/ui/summary"
import { HistoryIcon, Settings2Icon } from "lucide-react"

type InstrumentHistorySheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  target: InstrumentHistoryTarget
  display: FinanceMoneyDisplay
}

export function InstrumentHistorySheet({
  open,
  onOpenChange,
  target,
  display,
}: InstrumentHistorySheetProps) {
  const historyQuery = useInstrumentHistory(open, target)
  const items = infiniteListItems(historyQuery.data)

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Historial">
      {historyQuery.isError ? (
        <FinanceErrorState
          message={financeErrorMessage(historyQuery.error)}
          onRetry={() => void historyQuery.refetch()}
          isRetrying={historyQuery.isFetching}
        />
      ) : null}

      <AsyncRegion
        pending={historyQuery.isPending && !historyQuery.data}
        pendingFallback={<FinanceListSkeleton />}
        empty={items.length === 0}
        emptyFallback={
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HistoryIcon />
              </EmptyMedia>
              <EmptyTitle>Sin historial</EmptyTitle>
              <EmptyDescription>
                Aquí aparecen los ajustes de saldo y los cambios de límite.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        }
      >
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {items.map((item, index) => {
            const transition = instrumentHistoryLimitTransition(item)
            const amount =
              item.amount === null
                ? null
                : formatFinanceMoney(item.amount, {
                    ...display,
                    currency: item.currency ?? display.currency,
                  })
            return (
              <SummaryItem
                key={item.id}
                title={instrumentHistoryLabel(item)}
                description={formatFinanceDateTimeLabel(item.at)}
                icon={Settings2Icon}
                value={transition ?? amount ?? undefined}
                isLast={index === items.length - 1}
                className="px-3"
              />
            )
          })}
        </div>
        <InfiniteListSentinel
          hasNextPage={historyQuery.hasNextPage}
          isFetchingNextPage={historyQuery.isFetchingNextPage}
          onLoadMore={() => void historyQuery.fetchNextPage()}
        />
      </AsyncRegion>
    </BottomSheet>
  )
}
