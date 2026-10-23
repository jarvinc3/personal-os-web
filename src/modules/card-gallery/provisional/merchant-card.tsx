"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { TintedSurface } from "@/src/modules/card-gallery/provisional/tinted-surface"
import { Badge } from "@/src/shared/components/ui/badge"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"

export type MerchantCategory = {
  name: string
  icon: string | null
  color: string | null
}

type MerchantCardProps = {
  name: string
  logoUrl?: string | null
  alias?: string | null
  category?: MerchantCategory | null
  spendLabel?: string | null
  movementsLabel?: string | null
  duplicate?: boolean
  selected?: boolean
  variant?: "full" | "compact" | "inline"
  onPress?: () => void
}

function CategoryPill({ category }: { category: MerchantCategory }) {
  return (
    <span
      className="inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={
        category.color
          ? {
              backgroundColor: `color-mix(in srgb, ${category.color} 24%, transparent)`,
            }
          : undefined
      }
    >
      {category.icon ? <span aria-hidden>{category.icon}</span> : null}
      <span className="truncate">{category.name}</span>
    </span>
  )
}

/**
 * PROVISIONAL (#272): proposed merchant card, tinted with its category color.
 * Merchant has no production card yet (#281); delete with the gallery in #290.
 */
export function MerchantCard({
  name,
  logoUrl,
  alias,
  category,
  spendLabel,
  movementsLabel,
  duplicate = false,
  selected = false,
  variant = "full",
  onPress,
}: MerchantCardProps) {
  const color = category?.color ?? null
  const shellClassName = cn(
    "w-full text-left",
    onPress ? PRESSABLE_CLASS : undefined
  )

  if (variant === "inline") {
    const mention = (
      <>
        <BrandLogo name={name} logoUrl={logoUrl} size={16} />
        <span className="min-w-0 truncate text-sm font-medium">{name}</span>
        {category?.icon ? (
          <span className="shrink-0 text-xs" aria-hidden>
            {category.icon}
          </span>
        ) : null}
        {duplicate ? (
          <Badge variant="warning" className="shrink-0">
            ¿Duplicado?
          </Badge>
        ) : null}
      </>
    )

    if (onPress) {
      return (
        <button
          type="button"
          onClick={onPress}
          className="inline-flex max-w-full min-w-0 items-center gap-1.5 align-middle"
        >
          {mention}
        </button>
      )
    }

    return (
      <span className="inline-flex max-w-full min-w-0 items-center gap-1.5 align-middle">
        {mention}
      </span>
    )
  }

  if (variant === "compact") {
    const compactBody = (
      <TintedSurface
        color={color}
        className={cn(
          "p-2.5",
          selected && "ring-2 ring-info ring-offset-2 ring-offset-background"
        )}
      >
        <span className="flex items-center gap-2.5">
          <BrandLogo name={name} logoUrl={logoUrl} size={28} />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="min-w-0 truncate text-sm font-semibold">
                {name}
              </span>
              {duplicate ? (
                <Badge variant="warning" className="shrink-0">
                  ¿Duplicado?
                </Badge>
              ) : null}
            </span>
            <span className="flex min-w-0 items-center gap-1 text-[11px] text-muted-foreground">
              {category ? (
                <CategoryPill category={category} />
              ) : (
                <span className="truncate">Sin categoría</span>
              )}
              {alias ? (
                <span className="min-w-0 truncate">· {alias}</span>
              ) : null}
            </span>
          </span>
          <span className="shrink-0 text-sm font-semibold tabular-nums">
            {spendLabel ?? "Sin monto"}
          </span>
        </span>
      </TintedSurface>
    )

    if (onPress) {
      return (
        <button type="button" onClick={onPress} className={shellClassName}>
          {compactBody}
        </button>
      )
    }

    return <div className={shellClassName}>{compactBody}</div>
  }

  const fullBody = (
    <TintedSurface
      color={color}
      className={cn(
        "p-4",
        selected && "ring-2 ring-info ring-offset-2 ring-offset-background"
      )}
    >
      <span className="flex items-start gap-3">
        <BrandLogo name={name} logoUrl={logoUrl} size={44} />
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex min-w-0 items-center gap-2">
            <span className="min-w-0 truncate text-base font-semibold">
              {name}
            </span>
            {duplicate ? (
              <Badge variant="warning" className="shrink-0">
                ¿Duplicado?
              </Badge>
            ) : null}
          </span>
          <span className="min-w-0 truncate text-xs text-muted-foreground">
            {alias ? `También: ${alias}` : "Sin alias"}
          </span>
          <span className="mt-1 flex min-w-0 items-center gap-1">
            {category ? (
              <CategoryPill category={category} />
            ) : (
              <Badge variant="secondary">Sin categoría</Badge>
            )}
          </span>
        </span>
      </span>

      <span className="mt-3 flex items-end justify-between gap-3">
        <span className="flex min-w-0 flex-col">
          <span className="text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
            Gasto del mes
          </span>
          <span className="truncate text-lg font-bold tabular-nums">
            {spendLabel ?? "Sin monto"}
          </span>
        </span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {movementsLabel ?? "Sin movimientos"}
        </span>
      </span>
    </TintedSurface>
  )

  if (onPress) {
    return (
      <button type="button" onClick={onPress} className={shellClassName}>
        {fullBody}
      </button>
    )
  }

  return <div className={shellClassName}>{fullBody}</div>
}
