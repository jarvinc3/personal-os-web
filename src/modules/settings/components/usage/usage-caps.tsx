"use client"

import {
  formatUsageCost,
  formatUsageCount,
  formatUsagePercent,
  formatUsageReset,
  initialBudgetProgress,
  nextUtcDailyReset,
  usageProgress,
  type EmailUsageCostStatus,
  type EmailUsageSummary,
  type UsageProgress,
} from "@/src/modules/intelligence"
import { Card } from "@/src/shared/components/ui/card"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/src/shared/components/ui/item"
import {
  ALERT_TONE_CLASS_NAME,
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"
import { ProgressRing } from "@/src/shared/components/data-display/progress-ring"
import { TriangleAlertIcon } from "lucide-react"

const RING_SIZE = 44
const RING_THICKNESS = 4
const FULL_COST_PERCENT = 100

const COST_ARC_BY_STATUS: Record<EmailUsageCostStatus, string> = {
  OK: "stroke-primary",
  ALERT: "stroke-warning",
  PAUSED: "stroke-destructive",
}

type UsageCapsProps = {
  caps: EmailUsageSummary["caps"]
  now: Date
  locale: string
}

export function UsageCaps({ caps, now, locale }: UsageCapsProps) {
  const initial = initialBudgetProgress(caps.initial)
  const daily = usageProgress({
    limit: caps.daily.limitTokens,
    used: caps.daily.usedTokens,
  })
  const cost = usageProgress({
    limit: caps.globalCost.limitUsd,
    used: caps.globalCost.usedUsd,
  })
  const resetLabel = formatUsageReset(nextUtcDailyReset(now), locale)

  return (
    <div className="flex flex-col gap-3">
      <section className="flex flex-col gap-2">
        <div className="flex min-w-0 flex-col gap-0.5 px-1">
          <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Topes
          </h2>
          <p className="text-xs text-muted-foreground">
            Los topes diarios se reinician a las 00:00 UTC.
          </p>
        </div>
        <Card className="gap-0 bg-card p-1">
          <ItemGroup className="gap-0 divide-y divide-border/60">
            <UsageCapRow
              label="Carga inicial"
              description={`Quedan ${formatUsageCount(initial.remaining, locale)} de ${formatUsageCount(caps.initial.limit, locale)} clasificaciones.`}
              progress={initial}
              locale={locale}
              arcClassName="stroke-primary"
            />
            <UsageCapRow
              label="Tope diario"
              description={`Usaste ${formatUsageCount(daily.used, locale)} de ${formatUsageCount(caps.daily.limitTokens, locale)} tokens; quedan ${formatUsageCount(daily.remaining, locale)}.`}
              progress={daily}
              locale={locale}
              arcClassName="stroke-primary"
            />
            <UsageCapRow
              label="Costo global"
              description={`${formatUsageCost(cost.used, locale)} de ${formatUsageCost(caps.globalCost.limitUsd, locale)}. Se reinicia el ${resetLabel}.`}
              progress={cost}
              locale={locale}
              arcClassName={COST_ARC_BY_STATUS[caps.globalCost.status]}
            />
          </ItemGroup>
        </Card>
      </section>

      <UsageCostNotice
        status={caps.globalCost.status}
        alertRatio={caps.globalCost.alertRatio}
        resetLabel={resetLabel}
        locale={locale}
      />
    </div>
  )
}

type UsageCapRowProps = {
  label: string
  description: string
  progress: UsageProgress
  locale: string
  arcClassName: string
}

function UsageCapRow({
  label,
  description,
  progress,
  locale,
  arcClassName,
}: UsageCapRowProps) {
  return (
    <Item variant="plain" className="min-h-[52px] px-3 py-3">
      <ItemContent className="gap-0.5">
        <ItemTitle className="text-sm font-normal md:text-base">
          {label}
        </ItemTitle>
        <ItemDescription className="text-xs">{description}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <ProgressRing
          value={progress.percent}
          size={RING_SIZE}
          thickness={RING_THICKNESS}
          arcClassName={arcClassName}
        >
          <span className="text-[10px] font-semibold tabular-nums">
            {formatUsagePercent(progress.percent, locale)}
          </span>
        </ProgressRing>
      </ItemActions>
    </Item>
  )
}

type UsageCostNoticeProps = {
  status: EmailUsageCostStatus
  alertRatio: number
  resetLabel: string
  locale: string
}

function UsageCostNotice({
  status,
  alertRatio,
  resetLabel,
  locale,
}: UsageCostNoticeProps) {
  if (status === "OK") {
    return null
  }

  const fullPercent = formatUsagePercent(FULL_COST_PERCENT, locale)

  if (status === "PAUSED") {
    return (
      <Alert variant="destructive">
        <TriangleAlertIcon aria-hidden="true" />
        <AlertTitle>Clasificación pausada</AlertTitle>
        <AlertDescription>
          El tope global de costo llegó al {fullPercent}. Se reanuda el{" "}
          {resetLabel}.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className={ALERT_TONE_CLASS_NAME.warning}>
      <TriangleAlertIcon aria-hidden="true" />
      <AlertTitle>Alerta de costo</AlertTitle>
      <AlertDescription>
        El costo global llegó al{" "}
        {formatUsagePercent(alertRatio * FULL_COST_PERCENT, locale)} del tope.
        La clasificación se pausa al {fullPercent} y se reinicia el {resetLabel}
        .
      </AlertDescription>
    </Alert>
  )
}
