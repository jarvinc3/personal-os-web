"use client"

import { useBankCharges } from "@/src/modules/finance/shared/hooks/use-reconciliations"
import {
  formatFinanceMoney,
  parseFinanceMoney,
} from "@/src/modules/finance/shared/lib/money"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { FINANCE_RECONCILIATION_KIND_LABEL } from "@/src/modules/finance/shared/types/entities"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { LandmarkIcon } from "lucide-react"

type BankChargesCardProps = {
  enabled: boolean
  display: FinanceMoneyDisplay
  today: string
}

function chargesRange(today: string): { from: string; to: string } {
  return { from: `${today.slice(0, 4)}-01-01`, to: today }
}

function magnitude(value: string): number {
  const amount = parseFinanceMoney(value)
  return amount === null ? 0 : Math.abs(amount)
}

export function BankChargesCard({
  enabled,
  display,
  today,
}: BankChargesCardProps) {
  const range = chargesRange(today)
  const query = useBankCharges(enabled, range)
  const charges = query.data
  const maxMonth = Math.max(
    1,
    ...(charges?.byMonth.map((month) => magnitude(month.total)) ?? [1])
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LandmarkIcon className="size-5 text-muted-foreground" />
          Cargos bancarios
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {charges && charges.count > 0 ? (
          <>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">
                Total {range.from.slice(0, 4)}
              </span>
              <span className="text-lg font-semibold tabular-nums">
                {formatFinanceMoney(magnitude(charges.total), display)}
              </span>
            </div>
            <div className="flex flex-col gap-2">
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
                        (magnitude(month.total) / maxMonth) * 100
                      )}%`,
                    }}
                  />
                  <span className="ml-auto text-xs font-medium tabular-nums">
                    {formatFinanceMoney(magnitude(month.total), display)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              {charges.byKind.map((entry) => (
                <div
                  key={entry.kind}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">
                    {FINANCE_RECONCILIATION_KIND_LABEL[entry.kind]}
                  </span>
                  <span className="tabular-nums">
                    {formatFinanceMoney(magnitude(entry.total), display)}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <Empty className="py-6">
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
        )}
      </CardContent>
    </Card>
  )
}
