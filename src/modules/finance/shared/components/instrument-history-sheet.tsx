"use client"

import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { ListSkeleton } from "@/src/shared/components/feedback/list-skeleton"
import {
  useInstrumentHistory,
  type InstrumentHistoryTarget,
} from "@/src/modules/finance/shared/hooks/use-instrument-history"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { SheetHelpAction, type SheetGlossaryKey } from "@/src/modules/help"
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
import { SheetBody } from "@/src/shared/components/sheets/sheet-body"
import { SheetHeader } from "@/src/shared/components/sheets/sheet-header"
import { SHEET_FOOTER_CLASS } from "@/src/shared/components/sheets/sheet-layout"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { Button } from "@/src/shared/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/src/shared/components/ui/drawer"
import { InfiniteListSentinel } from "@/src/shared/components/feedback/infinite-list-sentinel"
import { SummaryItem } from "@/src/shared/components/data-display/summary"
import { HistoryIcon, Settings2Icon, XIcon } from "lucide-react"
import { instantToZonedWallTime } from "@/src/shared/lib/zoned-time"
import { useUserTimeZone } from "@/src/modules/settings/hooks/use-user-time-zone"

type InstrumentHistorySheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  target: InstrumentHistoryTarget
  display: FinanceMoneyDisplay
  helpSheetKey: SheetGlossaryKey
}

export function InstrumentHistorySheet({
  open,
  onOpenChange,
  target,
  display,
  helpSheetKey,
}: InstrumentHistorySheetProps) {
  const historyQuery = useInstrumentHistory(open, target)
  const timeZone = useUserTimeZone()
  const items = infiniteListItems(historyQuery.data)

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <SheetHeader
          title="Historial"
          actions={<SheetHelpAction sheetKey={helpSheetKey} />}
        />
        <SheetBody>
          {historyQuery.isError ? (
            <ErrorState
              message={financeErrorMessage(historyQuery.error)}
              onRetry={() => void historyQuery.refetch()}
              isRetrying={historyQuery.isFetching}
            />
          ) : null}

          <AsyncRegion
            pending={historyQuery.isPending && !historyQuery.data}
            pendingFallback={<ListSkeleton />}
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
                    description={formatFinanceDateTimeLabel(
                      instantToZonedWallTime(item.at, timeZone),
                      display.locale
                    )}
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
        </SheetBody>
        <DrawerFooter className={SHEET_FOOTER_CLASS}>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4 shrink-0" aria-hidden="true" />
            Cancelar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
