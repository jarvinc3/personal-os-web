"use client"

import type {
  FinanceExpenseTrend,
  FinanceExpenseTrendDirection,
  FinanceExpenseTrendTone,
} from "@/src/modules/finance/shared/lib/finance-home-month"
import { Badge } from "@/src/shared/components/ui/badge"
import { Minus, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react"

const TREND_ICONS: Record<FinanceExpenseTrendDirection, LucideIcon> = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
}

const TREND_VARIANTS: Record<
  FinanceExpenseTrendTone,
  "success" | "warning" | "danger" | "secondary"
> = {
  success: "success",
  warning: "warning",
  danger: "danger",
  neutral: "secondary",
}

export function FinanceExpenseTrendBadge({
  trend,
}: {
  trend: FinanceExpenseTrend
}) {
  const Icon = TREND_ICONS[trend.direction]
  return (
    <Badge variant={TREND_VARIANTS[trend.tone]}>
      <Icon />
      <span className="text-xs font-medium">{trend.label}</span>
    </Badge>
  )
}
