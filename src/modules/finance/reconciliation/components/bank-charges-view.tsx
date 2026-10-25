"use client"

import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import { useBankCharges } from "@/src/modules/finance/shared/hooks/use-reconciliations"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import {
  bankChargesRange,
  moneyMagnitude,
} from "@/src/modules/finance/shared/lib/reconciliation"
import { FINANCE_RECONCILIATION_KIND_LABEL } from "@/src/modules/finance/shared/types/entities"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import {
  SummaryItem,
  SummarySection,
} from "@/src/shared/components/data-display/summary"
import { Building2Icon, LandmarkIcon, TagsIcon } from "lucide-react"

type BankChargesViewProps = {
  enabled: boolean
  display: FinanceMoneyDisplay
  today: string
}

export function BankChargesView({
  enabled,
  display,
  today,
}: BankChargesViewProps) {
  const range = bankChargesRange(today)
  const query = useBankCharges(enabled, range)
  const charges = query.data
  const maxMonth = Math.max(
    1,
    ...(charges?.byMonth.map((month) => moneyMagnitude(month.total)) ?? [1])
  )
  const year = range.from.slice(0, 4)

  if (query.isError) {
    return (
      <FinanceErrorState
        message={financeErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
        isRetrying={query.isFetching}
      />
    )
  }

  return (
    <AsyncRegion
      pending={query.isPending}
      pendingFallback={<FinanceListSkeleton rows={4} />}
      empty={!charges || charges.count === 0}
      emptyFallback={
        <Empty className="py-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LandmarkIcon />
            </EmptyMedia>
            <EmptyTitle>Sin cargos este año</EmptyTitle>
            <EmptyDescription>
              Al conciliar una cuenta o tarjeta, la diferencia queda aquí.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      }
    >
      {charges ? (
        <div className="flex flex-col gap-4">
          <SummarySection
            title={`Total ${year}`}
            icon={LandmarkIcon}
            right={
              <span className="text-sm font-semibold tabular-nums">
                {formatFinanceMoney(moneyMagnitude(charges.total), display)}
              </span>
            }
          >
            <div className="flex flex-col gap-2 px-2 py-1">
              {charges.byMonth.map((month) => (
                <div key={month.month} className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-xs text-muted-foreground">
                    {month.month}
                  </span>
                  <span
                    className="h-2 rounded-full bg-primary/70"
                    style={{
                      width: `${Math.max(
                        4,
                        (moneyMagnitude(month.total) / maxMonth) * 100
                      )}%`,
                    }}
                  />
                  <span className="ml-auto text-xs font-medium tabular-nums">
                    {formatFinanceMoney(moneyMagnitude(month.total), display)}
                  </span>
                </div>
              ))}
            </div>
          </SummarySection>

          <SummarySection title="Por categoría" icon={TagsIcon}>
            {charges.byKind.map((entry, index) => (
              <SummaryItem
                key={entry.kind}
                title={FINANCE_RECONCILIATION_KIND_LABEL[entry.kind]}
                value={formatFinanceMoney(moneyMagnitude(entry.total), display)}
                isLast={index === charges.byKind.length - 1}
                className="px-3"
              />
            ))}
          </SummarySection>

          {charges.byInstitution.length > 0 ? (
            <SummarySection title="Por banco" icon={Building2Icon}>
              {charges.byInstitution.map((entry, index) => (
                <SummaryItem
                  key={entry.name}
                  title={entry.name}
                  value={formatFinanceMoney(
                    moneyMagnitude(entry.total),
                    display
                  )}
                  isLast={index === charges.byInstitution.length - 1}
                  className="px-3"
                />
              ))}
            </SummarySection>
          ) : null}
        </div>
      ) : null}
    </AsyncRegion>
  )
}
