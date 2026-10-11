"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import type { RingStackSlice } from "@/src/modules/finance/shared/lib/ring-stack"
import { cn } from "@/src/shared/lib/utils"
import { WalletIcon } from "lucide-react"
import type { KeyboardEvent, ReactNode } from "react"

/** Drawing constants measured from the reference mockup in `docs/suggest/image.png`. */
const RING_THICKNESS = 14
const RING_SPACING = 21
const INNERMOST_RADIUS = 56
const ACTIVE_EXTRA_THICKNESS = 6
/** Arcs start at twelve o'clock; a half turn is the whole gauge. */
const START_ANGLE = 90
const DEGREES_PER_PERCENT = 1.8
/**
 * A hair under 180° so the semicircle stays the short SVG arc. Exactly 180°
 * is ambiguous and some browsers drop it.
 */
const MAX_SWEEP = 179.5
const TRACK_OPACITY = 0.13
const UNMEASURED_TRACK_OPACITY = 0.32
/** The debt side of an arc: same colour, paler than the solid assets. */
const DEBT_ARC_OPACITY = 0.5
/** Room past the stroke so a round cap is not shaved by the viewBox. */
const CAP_PAD = 2

function ringPoint(radius: number, angleDegrees: number): string {
  const radians = (angleDegrees * Math.PI) / 180
  const pointHorizontally = (radius * Math.cos(radians)).toFixed(2)
  const pointVertically = (-radius * Math.sin(radians)).toFixed(2)
  return `${pointHorizontally} ${pointVertically}`
}

function sweepDegrees(percent: number): number {
  return Math.min(percent * DEGREES_PER_PERCENT, MAX_SWEEP)
}

function arcPath(radius: number, startDegrees: number, sweep: number): string {
  if (sweep <= 0) {
    return ""
  }
  const start = ringPoint(radius, startDegrees)
  const end = ringPoint(radius, startDegrees - sweep)
  return `M ${start} A ${radius} ${radius} 0 0 1 ${end}`
}

function ringLabel(slice: RingStackSlice): string {
  if (!slice.debtLabel) {
    return `${slice.name}, ${slice.percentLabel}`
  }
  return `${slice.name}, ${slice.percentLabel}, deuda ${slice.debtLabel}`
}

function isActivationKey(event: KeyboardEvent<SVGGElement>): boolean {
  return event.key === "Enter" || event.key === " "
}

type RingArcProps = {
  d: string
  color: string
  thickness: number
  opacity: number
}

function RingArc({ d, color, thickness, opacity }: RingArcProps) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={thickness}
      strokeLinecap="round"
      strokeOpacity={opacity}
    />
  )
}

type FinanceRingChartProps = {
  slices: RingStackSlice[]
  activeKey: string | null
  onSelect: (key: string) => void
  centerLabel: string
  centerValue: string
  /** Debt line under the value, null when the selected ring owes nothing. */
  centerDebt: string | null
  className?: string
}

export function FinanceRingChart({
  slices,
  activeKey,
  onSelect,
  centerLabel,
  centerValue,
  centerDebt,
  className,
}: FinanceRingChartProps) {
  const ringCount = slices.length
  const maxStroke = RING_THICKNESS + ACTIVE_EXTRA_THICKNESS
  const capClearance = maxStroke / 2 + CAP_PAD
  const outerCenter =
    INNERMOST_RADIUS + Math.max(ringCount - 1, 0) * RING_SPACING
  const outerEdge = outerCenter + capClearance
  const halfThickness = RING_THICKNESS / 2
  const innerRadius = INNERMOST_RADIUS - halfThickness
  // The gauge is the right-hand semicircle. The left margin only has to keep
  // the round caps; the hollow opens on that side.
  const leftMargin = capClearance
  const totalWidth = outerEdge + leftMargin
  // The centre text is HTML, not SVG, so it keeps a readable size when the
  // chart shrinks on a phone. It is centred in the visible hollow, from the
  // left edge of the box to the inner edge of the smallest ring.
  const hollowCenter = (-leftMargin + innerRadius) / 2
  const centreLeftPercent = ((hollowCenter + leftMargin) / totalWidth) * 100
  const centreWidthPercent = ((innerRadius + leftMargin) / totalWidth) * 100
  const gaugeSweep = sweepDegrees(100)

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox={`${-leftMargin} ${-outerEdge} ${totalWidth} ${outerEdge * 2}`}
        role="group"
        aria-label={`Anillos de balance. ${centerLabel}: ${centerValue}`}
        className="h-auto w-full"
      >
        {slices.map((slice, index) => {
          const radius =
            INNERMOST_RADIUS + (ringCount - 1 - index) * RING_SPACING
          const isActive = slice.key === activeKey
          const thickness = isActive
            ? RING_THICKNESS + ACTIVE_EXTRA_THICKNESS
            : RING_THICKNESS
          const arcSweep = sweepDegrees(slice.percent)
          const debtSweep =
            slice.value > 0 ? arcSweep * (slice.debtValue / slice.value) : 0
          const assetsSweep = arcSweep - debtSweep
          const track = arcPath(radius, START_ANGLE, gaugeSweep)
          const debtArc = arcPath(radius, START_ANGLE - assetsSweep, debtSweep)
          const assetsArc = arcPath(radius, START_ANGLE, assetsSweep)
          return (
            <g
              key={slice.key}
              role="button"
              tabIndex={0}
              aria-pressed={isActive}
              aria-label={ringLabel(slice)}
              className="cursor-pointer outline-none focus-visible:opacity-70"
              onClick={() => onSelect(slice.key)}
              onKeyDown={(event) => {
                if (!isActivationKey(event)) {
                  return
                }
                event.preventDefault()
                onSelect(slice.key)
              }}
            >
              <RingArc
                d={track}
                color={slice.color}
                thickness={thickness}
                opacity={
                  slice.value > 0 ? TRACK_OPACITY : UNMEASURED_TRACK_OPACITY
                }
              />
              {debtSweep > 0 ? (
                <RingArc
                  d={debtArc}
                  color={slice.color}
                  thickness={thickness}
                  opacity={DEBT_ARC_OPACITY}
                />
              ) : null}
              {assetsSweep > 0 ? (
                <RingArc
                  d={assetsArc}
                  color={slice.color}
                  thickness={thickness}
                  opacity={1}
                />
              ) : null}
            </g>
          )
        })}
      </svg>
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
        style={{
          left: `${centreLeftPercent}%`,
          width: `${centreWidthPercent}%`,
        }}
      >
        <p className="truncate text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase sm:text-[11px]">
          {centerLabel}
        </p>
        <p className="truncate text-lg font-bold text-foreground tabular-nums sm:text-xl">
          {centerValue}
        </p>
        {centerDebt ? (
          <p className="truncate text-xs font-medium text-muted-foreground sm:text-sm">
            Deuda {centerDebt}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function badgeContent(slice: RingStackSlice): ReactNode {
  if (slice.kind === "cash") {
    return <WalletIcon className="size-4 sm:size-5" />
  }
  if (slice.logoUrl) {
    return (
      <BrandLogo
        name={slice.name}
        logoUrl={slice.logoUrl}
        size={36}
        className="size-full rounded-lg bg-transparent text-white sm:rounded-xl"
      />
    )
  }
  return slice.monogram
}

type FinanceRingLegendProps = {
  slices: RingStackSlice[]
  activeKey: string | null
  onSelect: (key: string) => void
  className?: string
}

export function FinanceRingLegend({
  slices,
  activeKey,
  onSelect,
  className,
}: FinanceRingLegendProps) {
  return (
    <ul className={cn("flex min-w-0 flex-col gap-1", className)}>
      {slices.map((slice) => {
        const isActive = slice.key === activeKey
        return (
          <li key={slice.key}>
            <button
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(slice.key)}
              className={cn(
                "flex w-full cursor-pointer items-center gap-2 rounded-2xl px-1.5 py-2 text-left transition-colors sm:gap-3 sm:px-2",
                isActive ? "bg-muted" : "hover:bg-muted/50"
              )}
            >
              <span
                aria-hidden
                className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg text-[0.6rem] font-semibold text-white sm:size-9 sm:rounded-xl sm:text-xs"
                style={{ backgroundColor: slice.color }}
              >
                {badgeContent(slice)}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-semibold text-foreground sm:text-base">
                  {slice.name}
                </span>
                <span className="truncate text-xs text-muted-foreground sm:text-sm">
                  {slice.amountLabel}
                </span>
              </span>
              <span className="shrink-0 text-base font-semibold text-foreground tabular-nums sm:text-lg">
                {slice.percentLabel}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
