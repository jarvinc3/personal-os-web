"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { CategoryCard } from "@/src/modules/finance/shared/components/category-card"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import { Badge } from "@/src/shared/components/ui/badge"
import { LinkPendingOverlay } from "@/src/shared/components/ui/navigation-pending"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { CheckIcon } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

export type MerchantCardCategory = {
  name: string
  icon: string | null
  color: string | null
}

/** What the card paints of a merchant; `FinanceMerchant` satisfies it whole. */
export type MerchantCardSource = {
  name: string
  logoUrl: string | null
  aliases?: string[]
  monthSpend?: string
  monthMovements?: number
}

type MerchantCardProps = {
  merchant: MerchantCardSource
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
  /** Bajo la compacta: el contexto y la acción de un recurrente confirmable. */
  footer?: ReactNode
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
  footer,
}: MerchantCardProps) {
  const tint = category?.color ?? null
  const tintStyle = tint
    ? { backgroundColor: `color-mix(in srgb, ${tint} 10%, var(--card))` }
    : undefined
  const aliases = merchant.aliases ?? []
  const movementsLabel =
    merchant.monthMovements === undefined
      ? null
      : merchant.monthMovements > 0
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
      "relative flex w-full overflow-hidden rounded-xl border p-2.5 text-left",
      footer ? "flex-col" : "items-center gap-2.5",
      tint ? "border-transparent" : "border-border bg-card",
      disabled && "cursor-not-allowed opacity-50",
      !disabled && !footer && (href || onPress) && PRESSABLE_CLASS,
      selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
    )

    if (footer) {
      return (
        <div className={compactClassName} style={tintStyle}>
          <span className="flex w-full items-center gap-2.5">
            {compactBody}
          </span>
          <span className="mt-2 flex w-full border-t border-border/60 pt-2">
            {footer}
          </span>
        </div>
      )
    }

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

    if (onPress) {
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

    return (
      <div className={compactClassName} style={tintStyle}>
        {compactBody}
      </div>
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
              {size === "header" && aliases.length > 0 ? (
                <span className="block truncate text-xs text-muted-foreground">
                  También: {aliases.join(", ")}
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
            {movementsLabel ? (
              <span className="text-xs text-muted-foreground">
                {movementsLabel}
              </span>
            ) : null}
          </span>
        </span>
      </span>
      {merchant.monthSpend === undefined ? null : (
        <span className="flex items-end justify-between gap-2">
          <span className="text-xs text-muted-foreground">Gasto del mes</span>
          <span className="text-base font-semibold tabular-nums">
            {formatFinanceMoney(merchant.monthSpend, display)}
          </span>
        </span>
      )}
    </>
  )
  const fullClassName = cn(
    "flex w-full flex-col gap-3 overflow-hidden rounded-2xl border p-4 text-left",
    tint ? "border-transparent" : "border-border bg-card",
    disabled && "cursor-not-allowed opacity-50",
    !disabled && (href || onPress) && PRESSABLE_CLASS,
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

  if (onPress) {
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

  return (
    <div className={fullClassName} style={tintStyle}>
      {fullBody}
    </div>
  )
}
