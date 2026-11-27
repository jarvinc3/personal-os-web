"use client"

import { LinkPendingOverlay } from "@/src/shared/components/shell/navigation-pending"
import { ChevronDownIcon, ChevronRightIcon, LucideIcon } from "lucide-react"
import Link from "next/link"
import { ComponentProps, ReactNode } from "react"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/shared/components/ui/collapsible"
import { Marker, MarkerContent } from "@/src/shared/components/ui/marker"

type SummarySectionProps = {
  title?: string
  subtitle?: string
  icon?: LucideIcon
  right?: ReactNode
  children: ReactNode
  color?: string
  collapsible?: boolean
  defaultOpen?: boolean
}

type SummaryItemBaseProps = {
  title: ReactNode
  /** Wraps the title up to two lines instead of cutting it on the first one. */
  wrapTitle?: boolean
  description?: ReactNode
  /** Wraps the description on as many lines as it needs instead of cutting it. */
  wrapDescription?: boolean
  value?: ReactNode
  icon?: LucideIcon
  leading?: ReactNode
  accentColor?: string
  /** Tint the whole row with accentColor. Off by default so other lists stay unchanged. */
  tintRow?: boolean
  trailing?: ReactNode
  showChevron?: boolean
  isLast?: boolean
  disabled?: boolean
  className?: string
  leadingClassName?: string
}

type SummaryItemLinkProps = SummaryItemBaseProps & {
  href: ComponentProps<typeof Link>["href"]
  onPress?: never
}

type SummaryItemActionProps = SummaryItemBaseProps & {
  href?: never
  onPress?: () => void
}

export type SummaryItemProps = SummaryItemLinkProps | SummaryItemActionProps

export function SummarySection({
  title,
  defaultOpen = false,
  children,
  right,
  subtitle,
  icon: Icon,
  color,
  collapsible = false,
}: SummarySectionProps) {
  const tintStyle = color
    ? { backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)` }
    : undefined

  const rootClassName = "rounded-2xl border border-border bg-muted"

  const titleContent = (
    <div className="flex min-w-0 items-center gap-2">
      {Icon && (
        <Icon
          className={cn("size-4", !color && "text-muted-foreground")}
          style={color ? { color } : undefined}
        />
      )}
      <div className="flex flex-col justify-center -space-y-0.5">
        <span className="text-sm font-medium text-foreground">{title}</span>
        {subtitle && (
          <span className="truncate text-xs text-muted-foreground">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  )

  const header = title ? (
    <div className="flex flex-row items-center justify-between px-3 py-1">
      {collapsible ? (
        <CollapsibleTrigger className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-2 text-left">
          {titleContent}
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out group-data-open/summary:rotate-180" />
        </CollapsibleTrigger>
      ) : (
        titleContent
      )}
      {right && (
        <div
          className="flex shrink-0 flex-row items-center"
          onClick={collapsible ? (event) => event.stopPropagation() : undefined}
          onPointerDown={
            collapsible ? (event) => event.stopPropagation() : undefined
          }
        >
          {right}
        </div>
      )}
    </div>
  ) : null

  const body = (
    <div
      className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-2"
      style={tintStyle}
    >
      {children}
    </div>
  )

  if (collapsible) {
    return (
      <Collapsible
        defaultOpen={defaultOpen}
        className={cn(rootClassName, "group/summary")}
        style={tintStyle}
      >
        {header}
        <CollapsibleContent>{body}</CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <div className={rootClassName} style={tintStyle}>
      {header}
      {body}
    </div>
  )
}

type SummaryGroupProps = {
  title: string
  description?: string
  children: ReactNode
}

/** Une varios controles bajo un mismo concepto dentro de una sección. */
export function SummaryGroup({
  title,
  description,
  children,
}: SummaryGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <Marker variant="separator">
        <MarkerContent>{title}</MarkerContent>
      </Marker>
      {description ? (
        <p className="text-center text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
      {children}
    </div>
  )
}

export function SummaryItem({
  title,
  wrapTitle = false,
  description,
  wrapDescription = false,
  value,
  icon: Icon,
  leading,
  accentColor,
  tintRow = false,
  trailing,
  showChevron,
  isLast = false,
  disabled = false,
  className,
  leadingClassName,
  ...props
}: SummaryItemProps) {
  const href = disabled ? undefined : "href" in props ? props.href : undefined
  const onPress = disabled
    ? undefined
    : "onPress" in props
      ? props.onPress
      : undefined
  const isInteractive = Boolean(href ?? onPress)
  const chevronVisible = disabled ? false : (showChevron ?? Boolean(onPress))
  const showLeading = Boolean(leading) || Boolean(Icon)

  const tintStyle =
    tintRow && accentColor
      ? {
          backgroundColor: `color-mix(in srgb, ${accentColor} 32%, transparent)`,
        }
      : undefined

  const rowClassName = cn(
    "flex w-full items-center gap-3 p-2 text-left transition-all duration-200",
    !isInteractive && !isLast && "border-b border-border/60",
    isInteractive &&
      "rounded-2xl border border-border bg-card/50 hover:bg-muted/50",
    onPress && "cursor-pointer",
    !isInteractive && disabled && "opacity-50",
    className
  )
  const shellClassName = cn(
    PRESSABLE_CLASS,
    "flex w-full items-stretch overflow-hidden rounded-2xl"
  )

  const main = (
    <>
      {showLeading ? (
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full bg-muted",
            leadingClassName,
            leading ? "h-10 w-max min-w-10 px-1" : "size-10"
          )}
          style={
            accentColor
              ? {
                  backgroundColor: `color-mix(in srgb, ${accentColor} 18%, transparent)`,
                }
              : undefined
          }
        >
          {leading ??
            (Icon ? (
              <Icon
                className="size-5"
                style={accentColor ? { color: accentColor } : undefined}
              />
            ) : null)}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-sm font-medium",
            wrapTitle ? "line-clamp-2 break-words" : "truncate"
          )}
        >
          {title}
        </span>
        {description ? (
          <span
            className={cn(
              "block text-xs text-muted-foreground",
              wrapDescription ? "break-words whitespace-normal" : "truncate"
            )}
          >
            {description}
          </span>
        ) : null}
      </span>
      {value ? (
        <span className="shrink-0 text-sm font-semibold tabular-nums">
          {value}
        </span>
      ) : null}
      {chevronVisible ? (
        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
      ) : null}
    </>
  )

  if (href) {
    return (
      <div className={shellClassName} style={tintStyle}>
        <Link
          href={href}
          className={cn(rowClassName, "relative min-w-0 flex-1")}
        >
          {main}
          <LinkPendingOverlay />
        </Link>
        {trailing ? (
          <div className="flex shrink-0 items-center pr-2">{trailing}</div>
        ) : null}
      </div>
    )
  }

  if (onPress) {
    return (
      <div className={shellClassName} style={tintStyle}>
        <button
          type="button"
          className={cn(rowClassName, "min-w-0 flex-1")}
          onClick={onPress}
        >
          {main}
        </button>
        {trailing ? (
          <div className="flex shrink-0 items-center pr-2">{trailing}</div>
        ) : null}
      </div>
    )
  }

  return (
    <div
      className={rowClassName}
      style={tintStyle}
      aria-disabled={disabled || undefined}
    >
      {main}
      {trailing}
    </div>
  )
}
