"use client"

import { ChevronDownIcon, ChevronRightIcon, LucideIcon } from "lucide-react"
import Link from "next/link"
import { ComponentProps, ReactNode } from "react"
import { cn, PRESSABLE_CLASS } from "../../lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible"

type SummarySectionProps = {
  title?: string
  icon?: LucideIcon
  right?: ReactNode
  children: ReactNode
  color?: string
  collapsible?: boolean
}

export function SummarySection({
  title,
  children,
  right,
  icon: Icon,
  color,
  collapsible = false,
}: SummarySectionProps) {
  const titleContent = (
    <div className="flex min-w-0 items-center gap-2">
      {Icon && <Icon className="size-4 text-muted-foreground" />}
      <span className="text-sm font-medium text-muted-foreground">{title}</span>
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
          className="flex shrink-0 flex-row items-center gap-2"
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
        "flex flex-col gap-3 rounded-2xl border border-border bg-card p-3",
        color
      )}
    >
      {children}
    </div>
  )

  const rootClassName = cn("rounded-2xl border border-border bg-muted", color)

  if (collapsible) {
    return (
      <Collapsible defaultOpen className={cn(rootClassName, "group/summary")}>
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

type SummaryItemBaseProps = {
  title: string
  description?: ReactNode
  value?: ReactNode
  icon?: LucideIcon
  leading?: ReactNode
  accentColor?: string
  trailing?: ReactNode
  showChevron?: boolean
  isLast?: boolean
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

export function SummaryItem({
  title,
  description,
  value,
  icon: Icon,
  leading,
  accentColor,
  trailing,
  showChevron,
  isLast = false,
  className,
  ...props
}: SummaryItemProps) {
  const href = "href" in props ? props.href : undefined
  const onPress = "onPress" in props ? props.onPress : undefined
  const isInteractive = Boolean(href ?? onPress)
  const chevronVisible = showChevron ?? Boolean(onPress)
  const showLeading = Boolean(leading) || Boolean(Icon)

  const rowClassName = cn(
    "flex w-full items-center gap-3 py-3 text-left",
    !isLast && "border-b border-border/60",
    isInteractive && cn(PRESSABLE_CLASS, "hover:bg-muted/50"),
    onPress && "cursor-pointer",
    className
  )

  const content = (
    <>
      {showLeading ? (
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted"
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
        <span className="block truncate text-sm font-medium">{title}</span>
        {description ? (
          <span className="block truncate text-xs text-muted-foreground">
            {description}
          </span>
        ) : null}
      </span>
      {value ? (
        <span className="shrink-0 text-sm font-semibold tabular-nums">
          {value}
        </span>
      ) : null}
      {trailing}
      {chevronVisible ? (
        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
      ) : null}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={rowClassName}>
        {content}
      </Link>
    )
  }

  if (onPress) {
    return (
      <button type="button" className={rowClassName} onClick={onPress}>
        {content}
      </button>
    )
  }

  return <div className={rowClassName}>{content}</div>
}
