"use client"

import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import type { SubscriptionShortcutBadges } from "@/src/modules/finance/subscriptions/lib/subscription-display"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { Badge } from "@/src/shared/components/ui/badge"
import { LinkPendingOverlay } from "@/src/shared/components/ui/navigation-pending"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import {
  CalendarDaysIcon,
  ClockIcon,
  InboxIcon,
  RepeatIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"

type ShortcutTone = "warning" | "danger" | "info" | "muted"

const TONE_CLASS: Record<ShortcutTone, string> = {
  warning: "text-warning",
  danger: "text-danger",
  info: "text-info",
  muted: "text-muted-foreground",
}

type SubscriptionsHeroProps = {
  monthlyCost: string
  annualCost: string
  activeCount: number
  baseCurrency: string
  badges: SubscriptionShortcutBadges
  loading: boolean
  onUpcoming: () => void
  onAlerts: () => void
  onDetected: () => void
}

/**
 * Loose hero of Suscripciones: the monthly cost and the four shortcuts that
 * open the secondary views.
 */
export function SubscriptionsHero({
  monthlyCost,
  annualCost,
  activeCount,
  baseCurrency,
  badges,
  loading,
  onUpcoming,
  onAlerts,
  onDetected,
}: SubscriptionsHeroProps) {
  const display = {
    currency: baseCurrency,
    showCents: false,
    compactNumbers: false,
  }

  return (
    <section className="relative flex flex-col gap-4 overflow-hidden px-1 pt-2">
      <div className="flex flex-col items-center gap-1">
        <span className="flex items-center gap-2 text-base font-medium text-foreground">
          <RepeatIcon className="size-4 text-success" aria-hidden />
          Gasto mensual
        </span>
        {loading ? (
          <Skeleton className="h-10 w-40" />
        ) : (
          <p className="text-4xl font-bold tracking-tight tabular-nums">
            {formatFinanceMoney(monthlyCost, display)}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          {formatFinanceMoney(annualCost, display)} al año · {activeCount}{" "}
          activa
          {activeCount === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <ShortcutButton
          icon={ClockIcon}
          label="Próximos"
          tone="warning"
          dot={badges.upcoming}
          onPress={onUpcoming}
        />
        <ShortcutButton
          icon={TriangleAlertIcon}
          label="Alertas"
          tone="danger"
          count={badges.alerts}
          onPress={onAlerts}
        />
        <ShortcutButton
          icon={InboxIcon}
          label="Detectados"
          tone="info"
          count={badges.detected}
          onPress={onDetected}
        />
        <Link
          href={APP_ROUTES.app.financeSubscriptionsCalendar}
          aria-label="Calendario"
          className={cn(
            "relative flex flex-col items-center gap-1 rounded-2xl border border-border bg-card px-1 py-3",
            PRESSABLE_CLASS
          )}
        >
          <CalendarDaysIcon className="size-5 text-foreground" aria-hidden />
          <span className="text-xs text-muted-foreground">Calendario</span>
          <LinkPendingOverlay />
        </Link>
      </div>
    </section>
  )
}

type ShortcutButtonProps = {
  icon: LucideIcon
  label: string
  tone: ShortcutTone
  /** At least one pending item: a plain dot, no number. */
  dot?: boolean
  /** Number of pending items. */
  count?: number
  onPress: () => void
}

function ShortcutButton({
  icon: Icon,
  label,
  tone,
  dot = false,
  count = 0,
  onPress,
}: ShortcutButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onPress}
      className={cn(
        "relative flex flex-col items-center gap-1 rounded-2xl border border-border bg-card px-1 py-3",
        "cursor-pointer transition-colors hover:bg-muted/50",
        PRESSABLE_CLASS
      )}
    >
      <Icon className={cn("size-5", TONE_CLASS[tone])} aria-hidden />
      <span className="text-xs text-muted-foreground">{label}</span>
      {dot ? (
        <span className="absolute top-2 right-3 size-2 rounded-full bg-warning" />
      ) : null}
      {count > 0 ? (
        <Badge
          variant={tone === "danger" ? "danger" : "info"}
          className="absolute -top-1.5 right-2 h-4 min-w-4 px-1"
        >
          {count}
        </Badge>
      ) : null}
    </button>
  )
}
