"use client"

import {
  formatUsageCost,
  formatUsageCount,
  usageTotalTokens,
  usageTypeLabel,
  type EmailUsageBank,
  type EmailUsageBucket,
  type EmailUsageType,
} from "@/src/modules/intelligence"
import { Card } from "@/src/shared/components/ui/card"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/src/shared/components/ui/item"

type UsageBreakdownsProps = {
  byBank: EmailUsageBank[]
  byType: EmailUsageType[]
  locale: string
}

export function UsageBreakdowns({
  byBank,
  byType,
  locale,
}: UsageBreakdownsProps) {
  if (!byBank.length && !byType.length) {
    return null
  }

  return (
    <div className="flex flex-col gap-6">
      {byBank.length ? (
        <section className="flex flex-col gap-2">
          <div className="flex min-w-0 flex-col gap-0.5 px-1">
            <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Por remitente
            </h2>
            <p className="text-xs text-muted-foreground">
              Se agrupan por quién envió cada correo clasificado.
            </p>
          </div>
          <Card className="gap-0 bg-card p-1">
            <ItemGroup className="gap-0 divide-y divide-border/60">
              {byBank.map((bucket) => (
                <UsageBreakdownRow
                  key={bucket.bank}
                  label={bucket.bank}
                  bucket={bucket}
                  locale={locale}
                />
              ))}
            </ItemGroup>
          </Card>
        </section>
      ) : null}

      {byType.length ? (
        <section className="flex flex-col gap-2">
          <div className="flex min-w-0 flex-col gap-0.5 px-1">
            <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Por tipo de clasificación
            </h2>
            <p className="text-xs text-muted-foreground">
              Qué clase de correo es cada uno.
            </p>
          </div>
          <Card className="gap-0 bg-card p-1">
            <ItemGroup className="gap-0 divide-y divide-border/60">
              {byType.map((bucket) => (
                <UsageBreakdownRow
                  key={bucket.type}
                  label={usageTypeLabel(bucket.type)}
                  bucket={bucket}
                  locale={locale}
                />
              ))}
            </ItemGroup>
          </Card>
        </section>
      ) : null}
    </div>
  )
}

type UsageBreakdownRowProps = {
  label: string
  bucket: EmailUsageBucket
  locale: string
}

function UsageBreakdownRow({ label, bucket, locale }: UsageBreakdownRowProps) {
  const calls = formatUsageCount(bucket.calls, locale)

  return (
    <Item variant="plain" className="min-h-[52px] px-3 py-3">
      <ItemContent className="gap-0.5">
        <div className="flex flex-col gap-0.5 md:flex-row md:items-center md:justify-between md:gap-3">
          <ItemTitle className="text-sm font-normal md:text-base">
            {label}
          </ItemTitle>
          <ItemDescription className="max-w-[90%] truncate text-xs md:text-right">
            {bucket.calls === 1 ? "1 llamada" : `${calls} llamadas`}
          </ItemDescription>
        </div>
        <ItemDescription className="text-xs">
          {`${formatUsageCount(usageTotalTokens(bucket), locale)} tokens · ${formatUsageCost(bucket.costUsd, locale)}`}
        </ItemDescription>
      </ItemContent>
    </Item>
  )
}
