"use client"

import { SummaryItem } from "@/src/shared/components/ui/summary"
import { cn } from "@/src/shared/lib/utils"
import { LockIcon, TagsIcon, UserIcon } from "lucide-react"
import type { ReactNode } from "react"

export function subcategoryCountLabel(count: number): string {
  if (count === 1) return "1 subcategoría"
  return `${count} subcategorías`
}

export function CategoryCard({
  name,
  icon,
  color,
  isSystem,
  description,
  onPress,
  trailing,
  isLast = true,
  variant = "default",
  className,
}: {
  name: string
  icon: string | null
  color?: string | null
  isSystem: boolean
  description?: string
  onPress?: () => void
  trailing?: ReactNode
  isLast?: boolean
  /** Hides the system/personal mark. Used by the transaction category picker. */
  variant?: "default" | "pick"
  className?: string
}) {
  const emoji = icon?.trim()
  return (
    <SummaryItem
      title={name.trim() || "Nueva categoría"}
      description={description}
      accentColor={color || undefined}
      tintRow={Boolean(color)}
      leading={
        emoji ? (
          <span className="text-lg leading-none" aria-hidden>
            {emoji}
          </span>
        ) : undefined
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
      showChevron={false}
      className={cn("pr-4", className)}
    />
  )
}
