import { cn } from "@/src/shared/lib/utils"
import type { ReactNode } from "react"

/** Superficie tintada con el color de la categoría; borrador hasta #281. */
export function TintedSurface({
  color,
  className,
  children,
}: {
  color?: string | null
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border",
        color ? "border-transparent" : "border-border bg-card",
        className
      )}
      style={
        color
          ? {
              backgroundColor: `color-mix(in srgb, ${color} 22%, var(--card))`,
            }
          : undefined
      }
    >
      {color ? (
        <span aria-hidden className="pointer-events-none absolute inset-0">
          <span
            className="absolute -top-10 -right-8 size-28 rounded-full"
            style={{
              backgroundColor: `color-mix(in srgb, ${color} 30%, transparent)`,
            }}
          />
          <span
            className="absolute -bottom-12 left-8 size-24 rounded-full"
            style={{
              backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`,
            }}
          />
        </span>
      ) : null}
      <span className="relative z-10 block">{children}</span>
    </div>
  )
}
