"use client"

import { Badge, badgeVariants } from "@/src/shared/components/ui/badge"
import { LinkPendingOverlay } from "@/src/shared/components/shell/navigation-pending"
import { useLongPress } from "@/src/shared/hooks/use-long-press"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import type { VariantProps } from "class-variance-authority"
import { CheckIcon, type LucideIcon } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

export type PlanningProgressTone =
  "primary" | "success" | "warning" | "danger" | "info"

/** Variante de la card; la galería /settings/appearance/cards la pinta (#272). */
export type PlanningProgressVariant = "full" | "compact" | "inline"

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"]

export type PlanningProgressBadge = {
  label: string
  variant?: BadgeVariant
}

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
  badge?: PlanningProgressBadge
  progress: number | null
  /** What the ring percentage measures, under the ring. */
  progressHint?: string
  currentHint: string
  currentLabel: string
  targetHint: string
  targetLabel: string
  caption?: ReactNode
  href?: string
  onPress?: () => void
  /** Present only while the list is picking cobros; adds the round check. */
  selection?: { selected: boolean; dimmed?: boolean }
  onLongPress?: () => void
  disabled?: boolean
  /** Ring and check mark while the card is picked in a selector. */
  selected?: boolean
  variant?: PlanningProgressVariant
}

const TONE_STROKE: Record<PlanningProgressTone, string> = {
  primary: "stroke-primary",
  success: "stroke-success",
  warning: "stroke-warning",
  danger: "stroke-destructive",
  info: "stroke-info",
}

const TONE_BAR: Record<PlanningProgressTone, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  info: "bg-info",
}

const TONE_ICON: Record<PlanningProgressTone, string> = {
  primary: "bg-primary/15 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-destructive/15 text-destructive",
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
  hint,
}: {
  value: number | null
  tone: PlanningProgressTone
  accentColor?: string | null
  tinted?: boolean
  hint?: string
}) {
  const visual = value === null ? 0 : clampPct(value)
  const offset = RING_CIRCUMFERENCE - (visual / 100) * RING_CIRCUMFERENCE
  const label = value === null ? "—" : `${Math.round(value)}%`

  return (
    <span className="flex w-14 shrink-0 flex-col items-center gap-0.5">
      <span className="relative grid size-14 place-items-center">
        <svg className="size-14 -rotate-90" viewBox="0 0 48 48" aria-hidden>
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
            className={tinted || accentColor ? undefined : TONE_STROKE[tone]}
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
      {hint ? (
        <span
          className={cn(
            "text-[9px] tracking-wide uppercase",
            tinted ? "text-white/70" : "text-muted-foreground"
          )}
        >
          {hint}
        </span>
      ) : null}
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
  progressHint,
  currentHint,
  currentLabel,
  targetHint,
  targetLabel,
  caption,
  href,
  onPress,
  selection,
  onLongPress,
  disabled = false,
  selected = false,
  variant = "full",
}: PlanningProgressCardProps) {
  const barWidth = progress === null ? 0 : clampPct(progress)
  const showLeading = Boolean(leading) || Boolean(Icon)
  const tinted = Boolean(surfaceColor)
  const pressHandlers = useLongPress(onLongPress)

  const content = (
    <>
      <span className="flex items-start gap-3">
        {showLeading ? (
          <span
            className={cn(
              "relative flex size-10 shrink-0 items-center justify-center rounded-full",
              tinted || accentColor ? undefined : TONE_ICON[tone],
              tinted && "bg-transparent"
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
            {selection ? (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full border-2",
                  selection.selected
                    ? "border-info bg-info text-white"
                    : "border-border bg-background"
                )}
              >
                {selection.selected ? <CheckIcon className="size-3" /> : null}
              </span>
            ) : null}
          </span>
        ) : null}
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">
                {title}
              </span>
              {description ? (
                <span
                  className={cn(
                    "block text-xs",
                    tinted ? "text-white/70" : "text-muted-foreground",
                    typeof description === "string" && "truncate"
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
                  tinted
                    ? "border-transparent bg-white/15 text-white"
                    : undefined
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
          hint={progressHint}
        />
      </span>

      <span className="flex flex-col gap-1.5">
        <span className="flex items-end justify-between gap-3">
          <span className="min-w-0">
            <span
              className={cn(
                "block text-xs",
                tinted ? "text-white/70" : "text-muted-foreground"
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
                tinted ? "text-white/70" : "text-muted-foreground"
              )}
            >
              {targetHint}
            </span>
            <span
              className={cn(
                "block truncate text-sm font-medium tabular-nums",
                tinted ? "text-white/80" : "text-muted-foreground"
              )}
            >
              {targetLabel}
            </span>
          </span>
        </span>
        <span
          className={cn(
            "h-2 w-full overflow-hidden rounded-full",
            tinted ? "bg-white/20" : "bg-muted"
          )}
        >
          <span
            className={cn(
              "block h-full rounded-full transition-[width]",
              tinted || accentColor ? undefined : TONE_BAR[tone],
              tinted && "bg-white"
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
              tinted ? "text-white/70" : "text-muted-foreground"
            )}
          >
            {caption}
          </span>
        ) : null}
      </span>
    </>
  )

  const className = cn(
    "relative flex w-full overflow-hidden text-left",
    variant === "full" && "flex-col gap-3 rounded-2xl p-3",
    variant === "compact" && "items-center gap-2.5 rounded-xl p-2.5",
    variant === "inline" &&
      "inline-flex max-w-full min-w-0 items-center gap-1.5 align-middle",
    variant !== "inline" && surfaceColor ? "text-white" : null,
    variant !== "inline" && !surfaceColor ? "bg-muted/50" : null,
    selection?.selected &&
      variant !== "inline" &&
      "border-2 border-info bg-info/[7%]",
    selection?.dimmed && "opacity-60",
    selected &&
      variant !== "inline" &&
      "ring-2 ring-primary ring-offset-2 ring-offset-background",
    disabled && "pointer-events-none opacity-50",
    (href || onPress) &&
      cn(
        PRESSABLE_CLASS,
        variant !== "inline" && "cursor-pointer",
        variant !== "inline" &&
          (surfaceColor ? "hover:brightness-110" : "hover:bg-muted")
      )
  )
  const style =
    surfaceColor && variant !== "inline"
      ? { backgroundColor: surfaceColor }
      : undefined

  const selectionMark = selection ? (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
        selection.selected
          ? "border-info bg-info text-white"
          : "border-border bg-background"
      )}
    >
      {selection.selected ? <CheckIcon className="size-3" /> : null}
    </span>
  ) : null

  const compactBody = (
    <>
      {decoration}
      <span className="relative z-10 flex min-w-0 flex-1 items-center gap-2.5">
        {showLeading ? (
          <span
            className={cn(
              "relative flex size-8 shrink-0 items-center justify-center rounded-full",
              tinted || accentColor ? undefined : TONE_ICON[tone],
              tinted && "bg-transparent"
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
            {leading ?? (Icon ? <Icon className="size-4" /> : null)}
          </span>
        ) : null}
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate text-sm font-medium">
              {title}
            </span>
            <span className="shrink-0 text-sm font-semibold tabular-nums">
              {currentLabel}
            </span>
          </span>
          {description ? (
            <span
              className={cn(
                "mt-0.5 block truncate text-[11px]",
                tinted ? "text-white/70" : "text-muted-foreground"
              )}
            >
              {description}
            </span>
          ) : null}
          <span
            className={cn(
              "mt-0.5 flex items-center justify-between gap-2 text-[11px]",
              tinted ? "text-white/70" : "text-muted-foreground"
            )}
          >
            <span className="min-w-0 truncate">
              {badge?.label ?? currentHint}
            </span>
            <span className="shrink-0 tabular-nums">
              {targetHint} {targetLabel}
            </span>
          </span>
          <span
            className={cn(
              "mt-1 block h-1.5 w-full overflow-hidden rounded-full",
              tinted ? "bg-white/20" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "block h-full rounded-full",
                tinted || accentColor ? undefined : TONE_BAR[tone],
                tinted && "bg-white"
              )}
              style={{
                width: `${barWidth}%`,
                backgroundColor: tinted
                  ? undefined
                  : (accentColor ?? undefined),
              }}
            />
          </span>
          {caption ? (
            <span
              className={cn(
                "mt-0.5 block truncate text-[11px]",
                tinted ? "text-white/70" : "text-muted-foreground"
              )}
            >
              {caption}
            </span>
          ) : null}
        </span>
        {selectionMark}
      </span>
    </>
  )

  const inlineBody = (
    <span className="relative z-10 flex min-w-0 items-center gap-1.5">
      {showLeading ? (
        <span className="flex size-5 shrink-0 items-center justify-center">
          {leading ?? (Icon ? <Icon className="size-4" /> : null)}
        </span>
      ) : null}
      <span className="min-w-0 truncate text-sm font-medium">{title}</span>
      {badge ? (
        <Badge variant={badge.variant ?? "secondary"} className="shrink-0">
          {badge.label}
        </Badge>
      ) : null}
      {selectionMark}
    </span>
  )

  const body = (
    <>
      {variant === "full" ? decoration : null}
      {variant === "compact" ? compactBody : null}
      {variant === "inline" ? inlineBody : null}
      {variant === "full" ? (
        <span className="relative z-10 flex flex-col gap-3">{content}</span>
      ) : null}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={className} style={style} {...pressHandlers}>
        {body}
        <LinkPendingOverlay />
      </Link>
    )
  }

  if (onPress) {
    return (
      <button
        type="button"
        className={className}
        style={style}
        onClick={onPress}
        disabled={disabled}
        {...pressHandlers}
      >
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
