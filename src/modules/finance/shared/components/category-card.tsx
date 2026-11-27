"use client"

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/src/shared/components/ui/item"
import { cn } from "@/src/shared/lib/utils"
import { LockIcon, TagsIcon, UserIcon } from "lucide-react"
import type { ReactNode } from "react"

export function subcategoryCountLabel(count: number): string {
  if (count === 1) {
    return "1 subcategoría"
  }
  return `${count} subcategorías`
}

export function CategoryCard({
  name,
  icon,
  color,
  isSystem,
  description,
  amount,
  onPress,
  leading,
  trailing,
  isLast = true,
  variant = "default",
  disabled = false,
  className,
}: {
  name: string
  icon: string | null
  color?: string | null
  isSystem: boolean
  description?: string
  /** Importe ya formateado del chip; la fila no lo usa. */
  amount?: string
  onPress?: () => void
  leading?: ReactNode
  trailing?: ReactNode
  isLast?: boolean
  /** Hides the system/personal mark. Used by the transaction category picker. */
  variant?: "default" | "pick" | "chip" | "inline"
  disabled?: boolean
  className?: string
}) {
  const emoji = icon?.trim()
  const empty = variant === "pick"
  const label = name.trim() || "Nueva categoría"

  // Variante compacta de la card; la galería /settings/appearance/cards la pinta (#272).
  if (variant === "chip" || variant === "inline") {
    const chip = variant === "chip"
    const content = (
      <>
        {emoji ? (
          <span
            aria-hidden
            className={chip ? "text-sm leading-none" : "text-base leading-none"}
          >
            {emoji}
          </span>
        ) : (
          <TagsIcon
            className={chip ? "size-3.5 shrink-0" : "size-4 shrink-0"}
            style={color ? { color } : undefined}
            aria-hidden
          />
        )}
        <span className="min-w-0 truncate">{label}</span>
        {chip && amount ? (
          <span className="shrink-0 text-[11px] font-semibold tabular-nums opacity-80">
            {amount}
          </span>
        ) : null}
      </>
    )
    const chipClassName = cn(
      "inline-flex w-fit max-w-full items-center gap-1 text-xs font-medium",
      chip && "h-7 rounded-full px-2.5",
      chip && !color && "bg-muted",
      disabled && "cursor-not-allowed opacity-50",
      !disabled && onPress && "cursor-pointer"
    )
    const chipStyle =
      chip && color
        ? {
            backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`,
          }
        : undefined

    if (onPress) {
      return (
        <button
          type="button"
          onClick={onPress}
          disabled={disabled}
          className={chipClassName}
          style={chipStyle}
        >
          {content}
        </button>
      )
    }

    return (
      <span className={chipClassName} style={chipStyle}>
        {content}
      </span>
    )
  }
  const interactive = Boolean(onPress) && !disabled
  const mediaContent =
    leading ??
    (emoji ? (
      <span className="text-lg leading-none" aria-hidden>
        {emoji}
      </span>
    ) : null)
  const mediaStyle = color
    ? { backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)` }
    : undefined
  const rowStyle = color
    ? { backgroundColor: `color-mix(in srgb, ${color} 32%, transparent)` }
    : undefined
  // Un trailing con su propio control no puede quedar dentro del botón de la fila.
  const outsideTrailing = interactive ? trailing : undefined
  const insideTrailing = outsideTrailing ? undefined : trailing

  const row = (
    <Item
      variant={interactive ? "default" : "plain"}
      className={cn(
        "pr-4",
        empty && "bg-background",
        className,
        !interactive && !isLast && "border-b border-border/60",
        disabled && "opacity-50",
        outsideTrailing && "min-w-0 flex-1"
      )}
      style={outsideTrailing ? undefined : rowStyle}
      aria-disabled={disabled || undefined}
      render={
        interactive ? <button type="button" onClick={onPress} /> : undefined
      }
    >
      {mediaContent ? (
        <ItemMedia
          className={cn(
            "h-10 w-max min-w-10 rounded-full px-1",
            empty && "bg-card"
          )}
          style={mediaStyle}
        >
          {mediaContent}
        </ItemMedia>
      ) : (
        <ItemMedia
          variant="icon"
          className={cn(empty && "bg-card")}
          style={mediaStyle}
        >
          <TagsIcon style={color ? { color } : undefined} />
        </ItemMedia>
      )}
      <ItemContent>
        <ItemTitle>{label}</ItemTitle>
        {description ? (
          <ItemDescription className="truncate text-xs">
            {description}
          </ItemDescription>
        ) : null}
      </ItemContent>
      {variant !== "pick" || insideTrailing ? (
        <ItemActions>
          {variant === "pick" ? null : (
            <span
              role="img"
              aria-label={isSystem ? "Sistema" : "Personal"}
              className="flex text-muted-foreground"
            >
              {isSystem ? (
                <LockIcon className="size-4" />
              ) : (
                <UserIcon className="size-4" />
              )}
            </span>
          )}
          {insideTrailing}
        </ItemActions>
      ) : null}
    </Item>
  )

  if (!outsideTrailing) {
    return row
  }

  return (
    <div
      className="flex w-full items-stretch overflow-hidden rounded-2xl"
      style={rowStyle}
    >
      {row}
      <div className="flex shrink-0 items-center pr-2">{outsideTrailing}</div>
    </div>
  )
}
