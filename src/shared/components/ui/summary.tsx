"use client";

import { ChevronDownIcon, LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "../../lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";

type SummarySectionProps = {
  title?: string;
  icon?: LucideIcon;
  right?: ReactNode;
  children: ReactNode;
  color?: string;
  collapsible?: boolean;
};

export function SummarySection({
  title,
  children,
  right,
  icon: Icon,
  color,
  collapsible = false,
}: SummarySectionProps) {
  const titleContent = (
    <div className="flex gap-2 items-center min-w-0">
      {Icon && <Icon className="size-4 text-muted-foreground" />}
      <span className="text-sm font-medium text-muted-foreground">{title}</span>
    </div>
  );

  const header = title ? (
    <div className="flex flex-row items-center justify-between px-3 py-1">
      {collapsible ? (
        <CollapsibleTrigger className="flex flex-1 min-w-0 items-center justify-between gap-2 cursor-pointer text-left">
          {titleContent}
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out group-data-open/summary:rotate-180" />
        </CollapsibleTrigger>
      ) : (
        titleContent
      )}
      {right && (
        <div
          className="flex flex-row gap-2 items-center shrink-0"
          onClick={collapsible ? (event) => event.stopPropagation() : undefined}
          onPointerDown={
            collapsible ? (event) => event.stopPropagation() : undefined
          }
        >
          {right}
        </div>
      )}
    </div>
  ) : null;

  const body = (
    <div
      className={cn(
        "flex flex-col gap-3 p-3 rounded-2xl border border-border bg-card",
        color,
      )}
    >
      {children}
    </div>
  );

  const rootClassName = cn("rounded-2xl border border-border bg-muted", color);

  if (collapsible) {
    return (
      <Collapsible defaultOpen className={cn(rootClassName, "group/summary")}>
        {header}
        <CollapsibleContent>{body}</CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <div className={rootClassName}>
      {header}
      {body}
    </div>
  );
}
