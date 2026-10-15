import { Button } from "@/src/shared/components/ui/button"
import { LinkPendingOverlay } from "@/src/shared/components/ui/navigation-pending"
import { cn } from "@/src/shared/lib/utils"
import {
  ArrowDownLeftIcon,
  ArrowRightLeftIcon,
  ArrowUpRightIcon,
  ChevronDownIcon,
  CreditCardIcon,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"

type FinanceHomeHeroProps = {
  balanceLabel: string
  balanceAmount: string
  sendHref: string
  receiveHref: string
  transferHref: string
  pendingHoldLabel?: string
  cashFlowLabel?: string
  onAccountPress?: () => void
  className?: string
}

type FinanceHomeHeroActionProps = {
  href: string
  icon: LucideIcon
  label: string
  className?: string
}

function FinanceHomeHeroAction({
  href,
  icon: Icon,
  label,
  className,
}: FinanceHomeHeroActionProps) {
  return (
    <Button
      asChild
      variant="outline"
      className={cn("relative flex-1", className)}
    >
      <Link href={href}>
        <Icon className="text-foreground" />
        <span className="text-base font-semibold text-foreground">{label}</span>
        <LinkPendingOverlay />
      </Link>
    </Button>
  )
}

function FinanceHomeGridPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-[0.35]">
      {Array.from({ length: 14 }, (_, row) => (
        <div
          key={`row-${row}`}
          className="absolute right-0 left-0 border-t border-border"
          style={{ top: row * 28 }}
        />
      ))}
      {Array.from({ length: 30 }, (_, col) => (
        <div
          key={`col-${col}`}
          className="absolute top-0 bottom-0 border-l border-border"
          style={{ left: col * 35 }}
        />
      ))}
    </div>
  )
}

export function FinanceHomeHero({
  balanceLabel,
  balanceAmount,
  sendHref,
  receiveHref,
  transferHref,
  pendingHoldLabel,
  cashFlowLabel,
  onAccountPress,
  className,
}: FinanceHomeHeroProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <FinanceHomeGridPattern />
      <div className="relative flex w-full flex-col gap-3 px-4 pt-4 pb-6">
        <Button
          variant="ghost"
          onClick={onAccountPress}
          className="flex-row items-center justify-center gap-2 self-center active:opacity-70"
        >
          <CreditCardIcon className="text-success" />
          <span className="text-base font-medium text-foreground">
            {balanceLabel}
          </span>
          <ChevronDownIcon className="text-muted-foreground" />
        </Button>

        <h2 className="text-center text-4xl font-bold tracking-tight text-foreground tabular-nums">
          {balanceAmount}
        </h2>

        <div className="flex flex-col">
          {pendingHoldLabel ? (
            <div className="self-center">
              <span className="text-sm text-muted-foreground">
                {pendingHoldLabel || "0"}
              </span>
            </div>
          ) : null}

          {cashFlowLabel ? (
            <div className="self-center">
              <span className="text-sm text-muted-foreground">
                {cashFlowLabel}
              </span>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-0.5 overflow-hidden rounded-2xl border border-border">
          <FinanceHomeHeroAction
            href={sendHref}
            icon={ArrowUpRightIcon}
            label="Gasto"
            className="rounded-none rounded-l-2xl"
          />
          <FinanceHomeHeroAction
            href={receiveHref}
            icon={ArrowDownLeftIcon}
            label="Ingreso"
            className="rounded-none"
          />
          <FinanceHomeHeroAction
            href={transferHref}
            icon={ArrowRightLeftIcon}
            label="Transf."
            className="rounded-none rounded-r-2xl"
          />
        </div>
      </div>
    </div>
  )
}
