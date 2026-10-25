import { HeaderBackButton } from "@/src/shared/components/shell/header/header-back-button"
import { HeaderTitle } from "@/src/shared/components/shell/header/header-title"
import { cn } from "@/src/shared/lib/utils"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

type SecondaryHeaderProps = {
  title: ReactNode
  actions?: ReactNode
  onBack: () => void
  pending?: boolean
  tinted?: boolean
  backIcon?: LucideIcon
  backLabel?: string
}

export function SecondaryHeader({
  title,
  actions,
  onBack,
  pending,
  tinted,
  backIcon,
  backLabel,
}: SecondaryHeaderProps) {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-[auto_1fr_auto] items-center gap-2 px-4 lg:px-6",
        tinted && "text-white"
      )}
    >
      <HeaderBackButton
        onBack={onBack}
        pending={pending}
        icon={backIcon}
        label={backLabel}
        className={
          tinted ? "text-white hover:bg-white/15 hover:text-white" : undefined
        }
      />
      <div className="min-w-0 justify-self-center">
        <HeaderTitle title={title} centered />
      </div>
      <div
        className={cn(
          "flex items-center justify-end",
          tinted &&
            "[&_button]:text-white [&_button]:hover:bg-white/15 [&_button]:hover:text-white"
        )}
      >
        {actions ?? <span className="size-8" aria-hidden="true" />}
      </div>
    </div>
  )
}
