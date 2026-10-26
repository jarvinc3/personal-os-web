"use client"

import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { ListSkeleton } from "@/src/shared/components/feedback/list-skeleton"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type { FinanceReceivable } from "@/src/modules/finance/shared/types/entities"
import {
  ReceivableCard,
  ReceivableTotalsStrip,
} from "@/src/modules/finance/receivables"
import type { useReceivableShareMode } from "@/src/modules/finance/planning/hooks/use-receivable-share-mode"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { HandshakeIcon, PlusIcon } from "lucide-react"

type PlanningReceivablesTabProps = {
  receivables: FinanceReceivable[]
  pending: boolean
  display: FinanceMoneyDisplay
  share: ReturnType<typeof useReceivableShareMode>
  shareDebtor: string | null
  onCreate: () => void
}

export function PlanningReceivablesTab({
  receivables,
  pending,
  display,
  share,
  shareDebtor,
  onCreate,
}: PlanningReceivablesTabProps) {
  return (
    <div className="flex flex-col gap-2">
      {receivables.length === 0 ? null : (
        <ReceivableTotalsStrip receivables={receivables} display={display} />
      )}
      <AsyncRegion
        pending={pending}
        pendingFallback={<ListSkeleton />}
        empty={receivables.length === 0}
        emptyFallback={
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HandshakeIcon />
              </EmptyMedia>
              <EmptyTitle>Aún no hay cobros</EmptyTitle>
              <EmptyDescription>
                Lo que te deben. Archiva o borra los que ya no apliquen.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={onCreate}>
                <PlusIcon className="size-4 shrink-0" />
                Crear cobro
              </Button>
            </EmptyContent>
          </Empty>
        }
      >
        {receivables.map((item) => {
          const dimmed =
            share.active &&
            shareDebtor !== null &&
            item.debtorName !== shareDebtor
          return (
            <ReceivableCard
              key={item.id}
              source={{ kind: "receivable", receivable: item }}
              display={display}
              href={
                share.active
                  ? undefined
                  : APP_ROUTES.app.financeReceivable(item.id)
              }
              onPress={
                share.active && !dimmed
                  ? () => share.toggle(item.id)
                  : undefined
              }
              selection={
                share.active
                  ? {
                      selected: share.selectedIds.includes(item.id),
                      dimmed,
                    }
                  : undefined
              }
              onLongPress={() =>
                share.active ? share.toggle(item.id) : share.selectOnly(item.id)
              }
            />
          )
        })}
      </AsyncRegion>
    </div>
  )
}
