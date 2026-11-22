"use client"

import { ProgressRing } from "@/src/shared/components/data-display/progress-ring"
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

  return (
    <ProgressRing
      value={percent}
      size={box}
      thickness={RING_STROKE}
      arcClassName={tone === "warning" ? "stroke-warning" : "stroke-primary"}
      className={cn("relative", className)}
    >
      {children}
    </ProgressRing>
  )
}
