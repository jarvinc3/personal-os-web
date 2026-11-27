"use client"

import { ChevronDownIcon, LucideIcon } from "lucide-react"
import { ReactNode } from "react"
import { cn } from "@/src/shared/lib/utils"
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
