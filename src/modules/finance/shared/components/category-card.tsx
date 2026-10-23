"use client"

import { SummaryItem } from "@/src/shared/components/ui/summary"
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

  // Variante compacta de la card; la galería /dev/cards la pinta (#272).
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
        {description ? (
          <span className="shrink-0 text-[11px] opacity-70">{description}</span>
        ) : null}
      </>
    )
    const chipClassName = cn(
      "inline-flex w-fit max-w-full items-center gap-1 text-xs font-medium",
      chip && "rounded-full border px-2 py-0.5",
      disabled && "cursor-not-allowed opacity-50",
      !disabled && onPress && "cursor-pointer"
    )
    const chipStyle =
      chip && color
        ? {
            backgroundColor: `color-mix(in srgb, ${color} 20%, transparent)`,
            borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
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
  return (
    <SummaryItem
      title={name.trim() || "Nueva categoría"}
      description={description}
      accentColor={color || undefined}
      tintRow={Boolean(color)}
      leadingClassName={empty ? "bg-card" : undefined}
      leading={
        leading ??
        (emoji ? (
          <span className="text-lg leading-none" aria-hidden>
            {emoji}
          </span>
        ) : undefined)
      }
      icon={emoji ? undefined : TagsIcon}
      value={
        variant === "pick" ? undefined : (
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
        )
      }
      trailing={trailing}
      isLast={isLast}
      onPress={onPress}
      disabled={disabled}
      showChevron={false}
      className={cn("pr-4", empty && "bg-background", className)}
    />
  )
}
