"use client"

import { cn } from "@/src/shared/lib/utils"
import type { ReactNode } from "react"

type ProgressRingProps = {
  /** 0–100 of progress; out-of-range values clamp. */
  value: number
  /** Diameter in px, including the stroke. */
  size: number
  /** Stroke width in px. */
  thickness: number
  /** Class of the filled arc, e.g. `stroke-primary`. */
  arcClassName?: string
  /** Inline arc color for an entity accent; wins over `arcClassName`. */
  color?: string
  /** Class of the track, e.g. `stroke-muted` or `stroke-white/25`. */
  trackClassName?: string
  /** Content in the middle, such as the percentage. */
  children?: ReactNode
  className?: string
}

function clampPct(value: number): number {
  return Math.min(100, Math.max(0, value))
}

/** The only progress ring: diameter, thickness, value and color. */
export function ProgressRing({
  value,
  size,
  thickness,
  arcClassName,
  color,
  trackClassName = "stroke-muted",
  children,
  className,
}: ProgressRingProps) {
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const filled = (clampPct(value) / 100) * circumference
  const center = size / 2

  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        aria-hidden="true"
        className="absolute inset-0"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          className={trackClassName}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          transform={`rotate(-90 ${center} ${center})`}
          className={color ? undefined : arcClassName}
          style={color ? { stroke: color } : undefined}
        />
      </svg>
      {children ? (
        <span className="absolute inset-0 flex items-center justify-center">
          {children}
        </span>
      ) : null}
    </span>
  )
}
