import type { ChatChartPoint } from "@/src/modules/ai/types/chat.types"

/** Fallback series colors, in order, when the agent sends no color. */
export const CHART_PALETTE = [
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#14B8A6",
] as const

export type ChartPointValue = {
  label: string
  value: number
  color: string
}

export function chartPoints(series: ChatChartPoint[]): ChartPointValue[] {
  return series.map((point, index) => ({
    label: point.label,
    value: Number(point.value) || 0,
    color: point.color ?? CHART_PALETTE[index % CHART_PALETTE.length],
  }))
}

export function chartConfig(title: string | undefined): {
  value: { label: string; color: string }
} {
  return {
    value: { label: title ?? "Monto", color: CHART_PALETTE[0] },
  }
}
