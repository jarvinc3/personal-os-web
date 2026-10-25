import { cn } from "@/src/shared/lib/utils"
import type { ReactNode } from "react"

type HeaderTitleProps = {
  title: ReactNode
  subtitle?: ReactNode
  centered?: boolean
}

export function HeaderTitle({
  title,
  subtitle,
  centered = false,
}: HeaderTitleProps) {
  if (subtitle) {
    return (
      <div
        className={cn("flex flex-col", centered && "items-center text-center")}
      >
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        <div className="text-xl font-semibold">{title}</div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "text-lg font-bold tracking-tight md:text-xl",
        centered && "text-center"
      )}
    >
      {title}
    </div>
  )
}
