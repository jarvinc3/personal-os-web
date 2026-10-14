"use client"

import { useBankCharges } from "@/src/modules/finance/shared/hooks/use-reconciliations"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import {
  bankChargesRange,
  moneyMagnitude,
} from "@/src/modules/finance/shared/lib/reconciliation"
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

export function BankChargesCard({
  enabled,
  display,
  today,
}: BankChargesCardProps) {
  const range = bankChargesRange(today)
  const query = useBankCharges(enabled, range)
  const charges = query.data
  const maxMonth = Math.max(
    1,
    ...(charges?.byMonth.map((month) => moneyMagnitude(month.total)) ?? [1])
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
                {formatFinanceMoney(moneyMagnitude(charges.total), display)}
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
            <div className="flex flex-col gap-1 border-t border-border pt-3">
              <span className="text-xs font-medium text-muted-foreground">
                Por categoría
              </span>
              {charges.byKind.map((entry) => (
                <div
                  key={entry.kind}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">
                    {FINANCE_RECONCILIATION_KIND_LABEL[entry.kind]}
                  </span>
                  <span className="tabular-nums">
                    {formatFinanceMoney(moneyMagnitude(entry.total), display)}
                  </span>
                </div>
              ))}
            </div>
            {charges.byInstitution.length > 0 ? (
              <div className="flex flex-col gap-1 border-t border-border pt-3">
                <span className="text-xs font-medium text-muted-foreground">
                  Por banco
                </span>
                {charges.byInstitution.map((entry) => (
                  <div
                    key={entry.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{entry.name}</span>
                    <span className="tabular-nums">
                      {formatFinanceMoney(moneyMagnitude(entry.total), display)}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
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
