"use client"

import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import { PlanningProgressCard } from "@/src/modules/finance/shared/components/planning-progress-card"
import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import {
  amountRatioPct,
  joinPlanningCaption,
} from "@/src/modules/finance/shared/lib/planning-lists"
import { FINANCE_RECEIVABLE_STATUS_LABEL } from "@/src/modules/finance/shared/types/entities"
import type { FinanceReceivable } from "@/src/modules/finance/shared/types/entities"
import {
  ReceivableTotalsStrip,
  receivableMoney,
} from "@/src/modules/finance/receivables"
import {
  remainingCaption,
  withCurrency,
} from "@/src/modules/finance/planning/lib/planning-captions"
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
        pendingFallback={<FinanceListSkeleton />}
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
          const money = withCurrency(display, item.currency)
          const readable = receivableMoney(item)
          const paid = readable?.paid ?? null
          const total = readable?.amount ?? null
          const tone =
            item.status === "PAID"
              ? "success"
              : item.status === "PARTIAL"
                ? "info"
                : "warning"
          const badgeVariant =
            item.status === "PAID"
              ? "success"
              : item.status === "PARTIAL"
                ? "info"
                : "warning"
          const dimmed =
            share.active &&
            shareDebtor !== null &&
            item.debtorName !== shareDebtor
          return (
            <PlanningProgressCard
              key={item.id}
              title={item.debtorName}
              description={item.description ?? undefined}
              icon={HandshakeIcon}
              tone={tone}
              badge={{
                label:
                  FINANCE_RECEIVABLE_STATUS_LABEL[item.status] ?? item.status,
                variant: badgeVariant,
              }}
              progress={
                readable ? amountRatioPct(item.paidAmount, item.amount) : null
              }
              currentHint="Cobrado"
              currentLabel={formatFinanceMoney(item.paidAmount, money)}
              targetHint="Total"
              targetLabel={formatFinanceMoney(item.amount, money)}
              caption={
                readable
                  ? joinPlanningCaption(
                      remainingCaption({
                        current: paid,
                        target: total,
                        display: money,
                        reached: "Cobro completo",
                        prefix: "Resta",
                      }),
                      item.dueDate
                        ? `Vence ${formatCalendarDate(item.dueDate, display.locale)}`
                        : undefined
                    )
                  : "Monto no disponible: el servidor envió un valor ilegible."
              }
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
