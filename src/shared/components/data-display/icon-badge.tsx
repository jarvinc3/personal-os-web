"use client"

import { cn } from "@/src/shared/lib/utils"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

export type IconBadgeTone =
  "primary" | "success" | "warning" | "info" | "destructive" | "muted"

const TONE_CLASS: Record<IconBadgeTone, string> = {
  primary: "bg-primary/15 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  info: "bg-info/15 text-info",
  destructive: "bg-destructive/15 text-destructive",
  muted: "bg-muted text-muted-foreground",
}

type IconBadgeProps = {
  icon?: LucideIcon
  /** Replaces the icon, e.g. the emoji of a category. */
  children?: ReactNode
  /** Diameter in px. */
  size?: number
  /** Token tone of the circle. */
  tone?: IconBadgeTone
  /** Entity or category accent: tinted circle, soft border and colored icon. */
  color?: string
  className?: string
}

/** Circle with an icon and a tone, instead of a ring drawn by hand. */
export function IconBadge({
  icon: Icon,
  children,
  size = 48,
  tone,
  color,
  className,
}: IconBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        color && "border-2",
        !color && tone && TONE_CLASS[tone],
        className
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: color ? `${color}1A` : undefined,
        borderColor: color ? `${color}33` : undefined,
      }}
    >
      {children ??
        (Icon ? (
          <Icon
            style={{ color }}
            className={cn(!color && "size-1/2")}
            aria-hidden="true"
          />
        ) : null)}
    </span>
  )
}
