"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import type { RingStackSlice } from "@/src/modules/finance/shared/lib/ring-stack"
import { cn } from "@/src/shared/lib/utils"
import { WalletIcon } from "lucide-react"
import Link from "next/link"
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
  if (!Number.isFinite(percent) || percent <= 0) {
    return 0
  }
  return Math.min(percent * DEGREES_PER_PERCENT, MAX_SWEEP)
}

type ArcDirection = "clockwise" | "counterclockwise"

type ArcPathInput = {
  radius: number
  startDegrees: number
  sweep: number
  direction?: ArcDirection
}

function arcPath({
  radius,
  startDegrees,
  sweep,
  direction = "clockwise",
}: ArcPathInput): string {
  if (!Number.isFinite(sweep) || sweep <= 0) {
    return ""
  }
  const endDegrees =
    direction === "clockwise" ? startDegrees - sweep : startDegrees + sweep
  const start = ringPoint(radius, startDegrees)
  const end = ringPoint(radius, endDegrees)
  const sweepFlag = direction === "clockwise" ? 1 : 0
  return `M ${start} A ${radius} ${radius} 0 0 ${sweepFlag} ${end}`
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
  /** When set, the centre value opens the net-worth breakdown. */
  centerHref?: string
  className?: string
}

export function FinanceRingChart({
  slices,
  activeKey,
  onSelect,
  centerLabel,
  centerValue,
  centerDebt,
  centerHref,
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
  const hasAssets = slices.some((slice) => slice.assetsValue > 0)
  const hasDebt = slices.some((slice) => slice.debtValue > 0)
  // Assets keep the right half. Debts only get their own left half when both
  // groups exist; alone, they use the full gauge so the chart stays compact.
  const showsBothGroups = hasAssets && hasDebt
  // The left margin only has to keep the round caps when the gauge is a single
  // semicircle. With two groups the left half needs the full radius.
  const leftMargin = capClearance
  const chartLeft = showsBothGroups ? -outerEdge : -leftMargin
  const chartWidth = outerEdge - chartLeft
  const hollowLeft = showsBothGroups ? -innerRadius : -leftMargin
  const hollowRight = innerRadius
  // The centre text is HTML, not SVG, so it keeps a readable size when the
  // chart shrinks on a phone. It is centred in the visible hollow.
  const centreLeftPercent =
    (((hollowLeft + hollowRight) / 2 - chartLeft) / chartWidth) * 100
  const centreWidthPercent = ((hollowRight - hollowLeft) / chartWidth) * 100
  const gaugeSweep = sweepDegrees(100)

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox={`${chartLeft} ${-outerEdge} ${chartWidth} ${outerEdge * 2}`}
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
          const assetsSweep = sweepDegrees(slice.assetsPercent)
          const debtSweep = sweepDegrees(slice.debtPercent)
          const track = arcPath({
            radius,
            startDegrees: START_ANGLE,
            sweep: gaugeSweep,
          })
          const debtTrack = arcPath({
            radius,
            startDegrees: START_ANGLE,
            sweep: gaugeSweep,
            direction: "counterclockwise",
          })
          const debtArc = arcPath({
            radius,
            startDegrees: START_ANGLE,
            sweep: debtSweep,
            direction: showsBothGroups ? "counterclockwise" : "clockwise",
          })
          const assetsArc = arcPath({
            radius,
            startDegrees: START_ANGLE,
            sweep: assetsSweep,
          })
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
              {showsBothGroups ? (
                <RingArc
                  d={debtTrack}
                  color={slice.color}
                  thickness={thickness}
                  opacity={
                    slice.value > 0 ? TRACK_OPACITY : UNMEASURED_TRACK_OPACITY
                  }
                />
              ) : null}
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
        aria-hidden={centerHref ? undefined : true}
        className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
        style={{
          left: `${centreLeftPercent}%`,
          width: `${centreWidthPercent}%`,
        }}
      >
        <p className="truncate text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase sm:text-[11px]">
          {centerLabel}
        </p>
        {centerHref ? (
          <Link
            href={centerHref}
            aria-label="Ver desglose del patrimonio"
            className="pointer-events-auto inline-block max-w-full rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="block max-w-full text-base leading-tight font-bold break-words text-foreground tabular-nums sm:text-lg">
              {centerValue}
            </span>
          </Link>
        ) : (
          <p className="max-w-full text-base leading-tight font-bold break-words text-foreground tabular-nums sm:text-lg">
            {centerValue}
          </p>
        )}
        {centerDebt ? (
          <p className="text-xs font-medium break-words text-muted-foreground sm:text-sm">
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
                <span className="text-xs whitespace-nowrap text-muted-foreground sm:text-sm">
                  {slice.amountLabel}
                </span>
              </span>
              <span className="max-w-[45%] shrink-0 text-right text-xs leading-tight font-semibold text-foreground tabular-nums sm:text-sm">
                {slice.percentLabel}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
