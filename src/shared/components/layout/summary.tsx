import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "../../lib/utils";

type SummarySectionProps = {
    title?: string;
    icon?: LucideIcon;
    right?: ReactNode;
    children: ReactNode;
    color?: string;
  };
  
  export function SummarySection({ title, children, right, icon: Icon, color }: SummarySectionProps) {
    return (
      <div className={cn("rounded-2xl border border-border bg-muted", color)}>
        {title && (
          <div className="flex flex-row items-center justify-between px-3 py-1">
            <div className="flex gap-2 items-center">
              {Icon && <Icon className="size-4 text-muted-foreground" />}
              <span className="text-sm font-medium text-muted-foreground">{title}</span>
            </div>
            {right && (
              <div className="flex-row gap-2 items-center">
                {right}
              </div>
            )}
          </div>
        )}
        <div className={cn("flex flex-col gap-3 p-3 rounded-2xl border border-border bg-card", color)}>
          {children}
        </div>
      </div>
    );
  }