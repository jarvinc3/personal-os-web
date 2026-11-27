"use client"

import {
  formatUsageCost,
  formatUsageCount,
  usageTotalTokens,
  type EmailUsageSummary,
} from "@/src/modules/intelligence"
import { Card } from "@/src/shared/components/ui/card"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/src/shared/components/ui/item"

type UsageTotalsProps = {
  totals: EmailUsageSummary["totals"]
  rangeLabel: string
  locale: string
}

export function UsageTotals({ totals, rangeLabel, locale }: UsageTotalsProps) {
  const totalRows = [
    {
      key: "calls",
      label: "Clasificaciones",
      description: `${formatUsageCount(totals.succeeded, locale)} con éxito y ${formatUsageCount(totals.failed, locale)} fallidas.`,
      value: formatUsageCount(totals.calls, locale),
    },
    {
      key: "tokens",
      label: "Tokens",
      description: "Entrada y salida enviados al modelo.",
      value: formatUsageCount(usageTotalTokens(totals), locale),
    },
    {
      key: "cost",
      label: "Costo estimado",
      description: "Lo que costó clasificar los correos del rango.",
      value: formatUsageCost(totals.costUsd, locale),
    },
  ]

  return (
    <section className="flex flex-col gap-2">
      <div className="flex min-w-0 flex-col gap-0.5 px-1">
        <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Resumen
        </h2>
        <p className="text-xs text-muted-foreground">{rangeLabel}</p>
      </div>
      <Card className="gap-0 bg-card p-1">
        <ItemGroup className="gap-0 divide-y divide-border/60">
          {totalRows.map(({ key, label, description, value }) => (
            <Item key={key} variant="plain" className="min-h-[52px] px-3 py-3">
              <ItemContent className="gap-0.5">
                <div className="flex flex-col gap-0.5 md:flex-row md:items-center md:justify-between md:gap-3">
                  <ItemTitle className="text-sm font-normal md:text-base">
                    {label}
                  </ItemTitle>
                  <ItemDescription className="max-w-[90%] truncate text-xs md:text-right">
                    {value}
                  </ItemDescription>
                </div>
                <ItemDescription className="text-xs">
                  {description}
                </ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      </Card>
    </section>
  )
}
