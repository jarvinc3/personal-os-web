"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { CategoryCard } from "@/src/modules/finance/shared/components/category-card"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import type { FinanceMerchant } from "@/src/modules/finance/shared/types/entities"
import { Badge } from "@/src/shared/components/ui/badge"
import { LinkPendingOverlay } from "@/src/shared/components/ui/navigation-pending"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { CheckIcon } from "lucide-react"
import Link from "next/link"

export type MerchantCardCategory = {
  name: string
  icon: string | null
  color: string | null
}

type MerchantCardProps = {
  merchant: FinanceMerchant
  category?: MerchantCardCategory | null
  display: FinanceMoneyDisplay
  variant?: "full" | "compact" | "inline"
  /** The detail header shows a larger logo and the aliases. */
  size?: "list" | "header"
  /** The back found other merchants that may be the same one. */
  duplicate?: boolean
  selected?: boolean
  disabled?: boolean
  href?: string
  onPress?: () => void
}

/** Card de comercio: tintada con el color de su categoría (#281). */
export function MerchantCard({
  merchant,
  category,
  display,
  variant = "full",
  size = "list",
  duplicate = false,
  selected = false,
  disabled = false,
  href,
  onPress,
}: MerchantCardProps) {
  const tint = category?.color ?? null
  const tintStyle = tint
    ? { backgroundColor: `color-mix(in srgb, ${tint} 10%, var(--card))` }
    : undefined
  const movementsLabel =
    merchant.monthMovements > 0
      ? `${merchant.monthMovements} mov. este mes`
      : "Sin movimientos este mes"

  if (variant === "inline") {
    const mention = (
      <>
        <BrandLogo name={merchant.name} logoUrl={merchant.logoUrl} size={16} />
        <span className="min-w-0 truncate text-sm font-medium">
          {merchant.name}
        </span>
        {category?.icon ? (
          <span className="shrink-0 text-xs" aria-hidden>
            {category.icon}
          </span>
        ) : null}
      </>
    )

    if (href && !disabled) {
      return (
        <Link
          href={href}
          className="inline-flex max-w-full min-w-0 items-center gap-1.5 align-middle"
        >
          {mention}
        </Link>
      )
    }

    if (onPress) {
      return (
        <button
          type="button"
          onClick={onPress}
          disabled={disabled}
          className="inline-flex max-w-full min-w-0 items-center gap-1.5 align-middle disabled:opacity-50"
        >
          {mention}
        </button>
      )
    }

    return (
      <span
        className={cn(
          "inline-flex max-w-full min-w-0 items-center gap-1.5 align-middle",
          disabled && "opacity-50"
        )}
      >
        {mention}
      </span>
    )
  }

  if (variant === "compact") {
    const compactBody = (
      <>
        <BrandLogo name={merchant.name} logoUrl={merchant.logoUrl} size={32} />
        <span className="flex min-w-0 flex-1 items-center gap-1.5">
          <span className="truncate text-sm font-semibold">
            {merchant.name}
          </span>
          {category?.icon ? (
            <span className="shrink-0 text-xs" aria-hidden>
              {category.icon}
            </span>
          ) : null}
        </span>
        {duplicate ? <Badge variant="warning">¿Duplicado?</Badge> : null}
        {selected ? (
          <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <CheckIcon className="size-3.5" aria-hidden />
          </span>
        ) : null}
      </>
    )
    const compactClassName = cn(
      "relative flex w-full items-center gap-2.5 overflow-hidden rounded-xl border p-2.5 text-left",
      tint ? "border-transparent" : "border-border bg-card",
      disabled ? "cursor-not-allowed opacity-50" : PRESSABLE_CLASS,
      selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
    )

    if (href && !disabled) {
      return (
        <Link
          href={href}
          className={compactClassName}
          style={tintStyle}
          aria-label={`Abrir ${merchant.name}`}
        >
          {compactBody}
          <LinkPendingOverlay />
        </Link>
      )
    }

    return (
      <button
        type="button"
        onClick={onPress}
        disabled={disabled}
        className={compactClassName}
        style={tintStyle}
        aria-label={`Abrir ${merchant.name}`}
      >
        {compactBody}
      </button>
    )
  }

  const fullBody = (
    <>
      <span className="flex items-start gap-3">
        <BrandLogo
          name={merchant.name}
          logoUrl={merchant.logoUrl}
          size={size === "header" ? 48 : 44}
        />
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex items-start justify-between gap-2">
            <span className="min-w-0">
              <span className="font-display block truncate text-base font-semibold">
                {merchant.name}
              </span>
              {size === "header" && merchant.aliases.length > 0 ? (
                <span className="block truncate text-xs text-muted-foreground">
                  También: {merchant.aliases.join(", ")}
                </span>
              ) : null}
            </span>
            {duplicate ? <Badge variant="warning">¿Duplicado?</Badge> : null}
          </span>
          <span className="flex flex-wrap items-center gap-1.5">
            <CategoryCard
              name={category?.name ?? "Sin categoría"}
              icon={category?.icon ?? null}
              color={category?.color ?? null}
              isSystem={false}
              variant="chip"
            />
            <span className="text-xs text-muted-foreground">
              {movementsLabel}
            </span>
          </span>
        </span>
      </span>
      <span className="flex items-end justify-between gap-2">
        <span className="text-xs text-muted-foreground">Gasto del mes</span>
        <span className="text-base font-semibold tabular-nums">
          {formatFinanceMoney(merchant.monthSpend, display)}
        </span>
      </span>
    </>
  )
  const fullClassName = cn(
    "flex w-full flex-col gap-3 overflow-hidden rounded-2xl border p-4 text-left",
    tint ? "border-transparent" : "border-border bg-card",
    disabled ? "cursor-not-allowed opacity-50" : PRESSABLE_CLASS,
    selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
  )

  if (href && !disabled) {
    return (
      <Link
        href={href}
        className={fullClassName}
        style={tintStyle}
        aria-label={`Abrir ${merchant.name}`}
      >
        {fullBody}
        <LinkPendingOverlay />
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={onPress}
      disabled={disabled}
      className={fullClassName}
      style={tintStyle}
      aria-label={`Abrir ${merchant.name}`}
    >
      {fullBody}
    </button>
  )
}
