"use client"

import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type { SubscriptionPricePoint } from "@/src/modules/finance/subscriptions/lib/subscription-price"
import { cn } from "@/src/shared/lib/utils"

const CHART_WIDTH = 320
const CHART_HEIGHT = 80
const CHART_PADDING = 6
const MONTH_SHORT = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
] as const

function monthLabel(date: string): string {
  const [year, month] = date.split("-")
  const index = Number(month) - 1
  const name = MONTH_SHORT[index] ?? ""
  return `${name} ${year?.slice(2) ?? ""}`
}

type SubscriptionPriceChartProps = {
  series: readonly SubscriptionPricePoint[]
  display: FinanceMoneyDisplay
  className?: string
}

/**
 * Amount over time: one step per change, filled under the line. The chart is
 * drawn with a fixed viewBox and a non-scaling stroke so it fills its box
 * without distorting the line.
 */
export function SubscriptionPriceChart({
  series,
  display,
  className,
}: SubscriptionPriceChartProps) {
  if (series.length === 0) {
    return null
  }
  const amounts = series.map((point) => point.amount)
  const max = Math.max(...amounts)
  const min = Math.min(...amounts)
  const span = max - min
  const step =
    series.length > 1
      ? (CHART_WIDTH - CHART_PADDING * 2) / (series.length - 1)
      : 0
  const points = series.map((point, index) => {
    const ratio = span === 0 ? 0.5 : (point.amount - min) / span
    const pointX = CHART_PADDING + step * index
    const pointY =
      CHART_HEIGHT - CHART_PADDING - ratio * (CHART_HEIGHT - CHART_PADDING * 2)
    return { pointX, pointY }
  })
  const line = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${point.pointX} ${point.pointY}`
    )
    .join(" ")
  const area = `${line} L${points.at(-1)?.pointX ?? 0} ${CHART_HEIGHT} L${points[0]?.pointX ?? 0} ${CHART_HEIGHT} Z`
  const middle = series[Math.floor((series.length - 1) / 2)]

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Precio actual ${display.currency}`}
        className="h-24 w-full text-primary"
      >
        <path d={area} fill="currentColor" opacity="0.12" />
        <path
          d={line}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{monthLabel(series[0]!.date)}</span>
        {middle ? <span>{monthLabel(middle.date)}</span> : null}
        <span>{monthLabel(series.at(-1)!.date)}</span>
      </div>
    </div>
  )
}
