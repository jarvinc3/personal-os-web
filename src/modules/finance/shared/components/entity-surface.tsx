import { cn } from "@/src/shared/lib/utils"
import type { CSSProperties } from "react"

export type EntitySurfaceShape =
  "circles" | "hexagons" | "slashes" | "triangles"

type EntitySurfaceSize = "sm" | "md" | "lg"

type SurfaceLayer = {
  className: string
  style?: CSSProperties
}

const HEXAGON_STYLE: CSSProperties = {
  clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
  transform: "rotate(30deg)",
}

const TRIANGLE_UP_STYLE: CSSProperties = {
  clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
}

const TRIANGLE_DOWN_STYLE: CSSProperties = {
  clipPath: "polygon(50% 100%, 0% 0%, 100% 0%)",
}

const CIRCLES: readonly SurfaceLayer[] = [
  { className: "absolute -top-10 -right-8 size-28 rounded-full bg-white/25" },
  {
    className: "absolute right-10 -bottom-12 size-24 rounded-full bg-black/15",
  },
]

const HEXAGONS_SMALL: readonly SurfaceLayer[] = [
  {
    className: "absolute -top-8 -right-6 size-24 bg-white/20",
    style: HEXAGON_STYLE,
  },
  {
    className: "absolute top-6 -right-10 size-28 bg-white/10",
    style: HEXAGON_STYLE,
  },
]

const HEXAGONS_LARGE: readonly SurfaceLayer[] = [
  {
    className: "absolute -top-16 -right-8 size-52 bg-white/20",
    style: HEXAGON_STYLE,
  },
  {
    className: "absolute top-14 -right-14 size-64 bg-white/10",
    style: HEXAGON_STYLE,
  },
]

const SLASHES: readonly SurfaceLayer[] = [
  {
    className:
      "absolute top-[-45%] right-[-12%] h-[190%] w-[38%] rotate-22 bg-black/20",
  },
  {
    className:
      "absolute bottom-[-55%] left-[-18%] h-28 w-[62%] -rotate-6 rounded-4xl bg-white/15",
  },
]

const TRIANGLES_CARD: readonly SurfaceLayer[] = [
  { className: "absolute -top-8 -right-6 size-40", style: TRIANGLE_UP_STYLE },
  {
    className: "absolute right-16 -bottom-10 size-28",
    style: TRIANGLE_DOWN_STYLE,
  },
]

const TRIANGLES_HEADER: readonly SurfaceLayer[] = [
  {
    className: "absolute -top-16 -right-10 size-72",
    style: TRIANGLE_UP_STYLE,
  },
  {
    className: "absolute right-20 -bottom-20 size-52",
    style: TRIANGLE_DOWN_STYLE,
  },
]

function surfaceLayers({
  shape,
  size,
  tinted,
}: {
  shape: EntitySurfaceShape
  size: EntitySurfaceSize
  tinted: boolean
}): readonly SurfaceLayer[] {
  if (shape === "hexagons") {
    return size === "sm" ? HEXAGONS_SMALL : HEXAGONS_LARGE
  }
  if (shape === "slashes") {
    return SLASHES
  }
  if (shape === "triangles") {
    const light = tinted ? "bg-white/20" : "bg-foreground/10"
    const dark = tinted ? "bg-black/20" : "bg-foreground/15"
    const base = size === "lg" ? TRIANGLES_HEADER : TRIANGLES_CARD
    return base.map((layer, index) => ({
      ...layer,
      className: cn(layer.className, index === 0 ? light : dark),
    }))
  }
  return CIRCLES
}

/**
 * Fondo decorativo de una card de entidad. Cada entidad tiene su forma: cuentas
 * círculos, institución hexágonos, tarjetas franjas y préstamos triángulos.
 */
export function EntitySurface({
  shape = "circles",
  size = "md",
  tinted = true,
  className,
}: {
  shape?: EntitySurfaceShape
  size?: EntitySurfaceSize
  tinted?: boolean
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      {surfaceLayers({ shape, size, tinted }).map((layer, index) => (
        <span key={index} className={layer.className} style={layer.style} />
      ))}
    </span>
  )
}
