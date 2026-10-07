"use client"

import { LinkPendingOverlay } from "@/src/shared/components/ui/navigation-pending";
import { ChevronDownIcon, ChevronRightIcon, LucideIcon } from "lucide-react";
import Link from "next/link";
import { ComponentProps, ReactNode } from "react";
import { cn, PRESSABLE_CLASS } from "../../lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";

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
  title: string
  description?: ReactNode
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
  const titleContent = (
    <div className="flex gap-2 items-center min-w-0">
      {Icon && <Icon className="size-4 text-muted-foreground" />}
      <div className="flex flex-col -space-y-0.5">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {subtitle && <span className="text-xs text-muted truncate">{subtitle}</span>}
      </div>
    </div>
  )

  const header = title ? (
    <div className="flex flex-row justify-between items-center px-3 py-1">
      {collapsible ? (
        <CollapsibleTrigger className="flex flex-1 gap-2 justify-between items-center min-w-0 text-left cursor-pointer">
          {titleContent}
          <ChevronDownIcon className="transition-transform duration-200 ease-out size-4 shrink-0 text-muted-foreground group-data-open/summary:rotate-180" />
        </CollapsibleTrigger>
      ) : (
        titleContent
      )}
      {right && (
        <div
          className="flex flex-row items-center shrink-0"
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
      className={cn(
        "flex flex-col gap-2 p-2 rounded-2xl border border-border bg-card",
        color
      )}
    >
      {children}
    </div>
  )

  const rootClassName = cn("rounded-2xl border border-border bg-muted", color)

  if (collapsible) {
    return (
      <Collapsible defaultOpen={defaultOpen} className={cn(rootClassName, "group/summary")}>
        {header}
        <CollapsibleContent>{body}</CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <div className={rootClassName}>
      {header}
      {body}
    </div>
  )
}

export function SummaryItem({
  title,
  description,
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
  ...props
}: SummaryItemProps) {
  const href = disabled ? undefined : "href" in props ? props.href : undefined
  const onPress = disabled ? undefined : "onPress" in props ? props.onPress : undefined
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
    "flex w-full items-center gap-3 p-2 rounded-2xl text-left transition-all duration-200",
    !isInteractive && !isLast && "border-b border-border/60",
    isInteractive && cn(PRESSABLE_CLASS, "hover:bg-muted/50"),
    onPress && "cursor-pointer",
    !isInteractive && disabled && "opacity-50",
    className
  )
  const shellClassName = cn(
    "flex w-full items-stretch overflow-hidden rounded-2xl",
    !isLast && "border-b border-border/60",
  )

  const main = (
    <>
      {showLeading ? (
        <span
          className="flex justify-center items-center rounded-full size-10 shrink-0 bg-muted"
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
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium truncate">{title}</span>
        {description ? (
          <span className="block text-xs truncate text-muted-foreground">
            {description}
          </span>
        ) : null}
      </span>
      {value ? (
        <span className="text-sm font-semibold tabular-nums shrink-0">
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
        <Link href={href} className={cn(rowClassName, "relative min-w-0 flex-1")}>
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
