"use client"

import { Badge, badgeVariants } from "@/src/shared/components/ui/badge"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import type { VariantProps } from "class-variance-authority"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

export type PlanningProgressTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"]

export type PlanningProgressCardProps = {
  title: string
  description?: ReactNode
  icon?: LucideIcon
  leading?: ReactNode
  tone?: PlanningProgressTone
  accentColor?: string | null
  /** Solid wash for product cards that belong to an institution. */
  surfaceColor?: string | null
  decoration?: ReactNode
  badge?: { label: string; variant?: BadgeVariant }
  progress: number | null
  currentHint: string
  currentLabel: string
  targetHint: string
  targetLabel: string
  caption?: ReactNode
  onPress?: () => void
}

const TONE_STROKE: Record<PlanningProgressTone, string> = {
  primary: "stroke-primary",
  success: "stroke-success",
  warning: "stroke-warning",
  danger: "stroke-danger",
  info: "stroke-info",
}

const TONE_BAR: Record<PlanningProgressTone, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
}

const TONE_ICON: Record<PlanningProgressTone, string> = {
  primary: "bg-primary/15 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
  info: "bg-info/15 text-info",
}

const RING_RADIUS = 18
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

function clampPct(value: number): number {
  return Math.min(100, Math.max(0, value))
}

function RingProgress({
  value,
  tone,
  accentColor,
  tinted,
}: {
  value: number | null
  tone: PlanningProgressTone
  accentColor?: string | null
  tinted?: boolean
}) {
  const visual = value === null ? 0 : clampPct(value)
  const offset = RING_CIRCUMFERENCE - (visual / 100) * RING_CIRCUMFERENCE
  const label = value === null ? "—" : `${Math.round(value)}%`

  return (
    <span className="relative grid size-14 shrink-0 place-items-center">
      <svg
        className="size-14 -rotate-90"
        viewBox="0 0 48 48"
        aria-hidden
      >
        <circle
          cx="24"
          cy="24"
          r={RING_RADIUS}
          fill="none"
          className={tinted ? "stroke-white/25" : "stroke-muted"}
          strokeWidth="4"
        />
        <circle
          cx="24"
          cy="24"
          r={RING_RADIUS}
          fill="none"
          className={
            tinted || accentColor ? undefined : TONE_STROKE[tone]
          }
          style={
            tinted
              ? { stroke: "white" }
              : accentColor
                ? { stroke: accentColor }
                : undefined
          }
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-[11px] font-semibold tabular-nums">
        {label}
      </span>
    </span>
  )
}

export function PlanningProgressCard({
  title,
  description,
  icon: Icon,
  leading,
  tone = "info",
  accentColor,
  surfaceColor,
  decoration,
  badge,
  progress,
  currentHint,
  currentLabel,
  targetHint,
  targetLabel,
  caption,
  onPress,
}: PlanningProgressCardProps) {
  const barWidth = progress === null ? 0 : clampPct(progress)
  const showLeading = Boolean(leading) || Boolean(Icon)
  const tinted = Boolean(surfaceColor)

  const content = (
    <>
      <span className="flex items-start gap-3">
        {showLeading ? (
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full",
              tinted || accentColor ? undefined : TONE_ICON[tone],
              tinted && "bg-transparent",
            )}
            style={
              !tinted && accentColor
                ? {
                    backgroundColor: `color-mix(in srgb, ${accentColor} 18%, transparent)`,
                    color: accentColor,
                  }
                : undefined
            }
          >
            {leading ?? (Icon ? <Icon className="size-5" /> : null)}
          </span>
        ) : null}
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{title}</span>
              {description ? (
                <span
                  className={cn(
                    "block text-xs",
                    tinted ? "text-white/70" : "text-muted-foreground",
                    typeof description === "string" && "truncate",
                  )}
                >
                  {description}
                </span>
              ) : null}
            </span>
            {badge ? (
              <Badge
                variant={badge.variant ?? "secondary"}
                className={
                  tinted ? "border-transparent bg-white/15 text-white" : undefined
                }
              >
                {badge.label}
              </Badge>
            ) : null}
          </span>
        </span>
        <RingProgress
          value={progress}
          tone={tone}
          accentColor={accentColor}
          tinted={tinted}
        />
      </span>

      <span className="flex flex-col gap-1.5">
        <span className="flex items-end justify-between gap-3">
          <span className="min-w-0">
            <span
              className={cn(
                "block text-xs",
                tinted ? "text-white/70" : "text-muted-foreground",
              )}
            >
              {currentHint}
            </span>
            <span className="block truncate text-sm font-semibold tabular-nums">
              {currentLabel}
            </span>
          </span>
          <span className="min-w-0 text-right">
            <span
              className={cn(
                "block text-xs",
                tinted ? "text-white/70" : "text-muted-foreground",
              )}
            >
              {targetHint}
            </span>
            <span
              className={cn(
                "block truncate text-sm font-medium tabular-nums",
                tinted ? "text-white/80" : "text-muted-foreground",
              )}
            >
              {targetLabel}
            </span>
          </span>
        </span>
        <span
          className={cn(
            "h-2 w-full overflow-hidden rounded-full",
            tinted ? "bg-white/20" : "bg-muted",
          )}
        >
          <span
            className={cn(
              "block h-full rounded-full transition-[width]",
              tinted || accentColor ? undefined : TONE_BAR[tone],
              tinted && "bg-white",
            )}
            style={{
              width: `${barWidth}%`,
              backgroundColor: tinted ? undefined : (accentColor ?? undefined),
            }}
          />
        </span>
        {caption ? (
          <span
            className={cn(
              "text-xs",
              tinted ? "text-white/70" : "text-muted-foreground",
            )}
          >
            {caption}
          </span>
        ) : null}
      </span>
    </>
  )

  const className = cn(
    "relative flex w-full flex-col gap-3 overflow-hidden rounded-2xl p-3 text-left",
    surfaceColor ? "text-white" : "bg-muted/50",
    onPress &&
      cn(
        PRESSABLE_CLASS,
        "cursor-pointer",
        surfaceColor ? "hover:brightness-110" : "hover:bg-muted",
      ),
  )
  const style = surfaceColor ? { backgroundColor: surfaceColor } : undefined
  const body = (
    <>
      {decoration}
      <span className="relative z-10 flex flex-col gap-3">{content}</span>
    </>
  )

  if (onPress) {
    return (
      <button type="button" className={className} style={style} onClick={onPress}>
        {body}
      </button>
    )
  }

  return (
    <div className={className} style={style}>
      {body}
    </div>
  )
}
