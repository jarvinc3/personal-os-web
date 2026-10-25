import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { cn } from "@/src/shared/lib/utils"
import { ChevronLeftIcon, type LucideIcon } from "lucide-react"

type HeaderBackButtonProps = {
  onBack: () => void
  pending?: boolean
  className?: string
  icon?: LucideIcon
  label?: string
}

export function HeaderBackButton({
  onBack,
  pending = false,
  className,
  icon: Icon = ChevronLeftIcon,
  label = "Volver",
}: HeaderBackButtonProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      className={cn("size-9 rounded-full", className)}
      onClick={onBack}
      disabled={pending}
      aria-label={label}
    >
      {pending ? (
        <Spinner className="size-4.5" />
      ) : (
        <Icon className="size-4.5" />
      )}
    </Button>
  )
}
