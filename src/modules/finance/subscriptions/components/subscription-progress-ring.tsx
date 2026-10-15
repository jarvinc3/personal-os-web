"use client"

import { cn } from "@/src/shared/lib/utils"
import type { ReactNode } from "react"

const RING_STROKE = 3
const RING_GAP = 3

type SubscriptionProgressRingProps = {
  /** 0–100 of the cycle already run. */
  percent: number
  /** Diameter of the logo the ring wraps. */
  size: number
  /** Amber when the charge is close, primary otherwise. */
  tone?: "primary" | "warning"
  className?: string
  children: ReactNode
}

/** Cycle progress painted as a ring around the brand logo. */
export function SubscriptionProgressRing({
  percent,
  size,
  tone = "primary",
  className,
  children,
}: SubscriptionProgressRingProps) {
  const box = size + (RING_STROKE + RING_GAP) * 2
  const radius = (box - RING_STROKE) / 2
  const circumference = 2 * Math.PI * radius
  const filled = (Math.min(100, Math.max(0, percent)) / 100) * circumference

  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: box, height: box }}
    >
      <svg
        viewBox={`0 0 ${box} ${box}`}
        width={box}
        height={box}
        aria-hidden
        className="absolute inset-0"
      >
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          strokeWidth={RING_STROKE}
          className="stroke-muted"
        />
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          transform={`rotate(-90 ${box / 2} ${box / 2})`}
          className={tone === "warning" ? "stroke-warning" : "stroke-primary"}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">
        {children}
      </span>
    </span>
  )
}
