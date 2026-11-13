"use client"

import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import { useFormatLocale } from "@/src/modules/settings/hooks/use-format-locale"
import type { SubscriptionShortcutBadges } from "@/src/modules/finance/subscriptions/lib/subscription-display"
import type { FinanceSubscriptionCurrencyCost } from "@/src/modules/finance/shared/types/entities"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { Badge } from "@/src/shared/components/ui/badge"
import { LinkPendingOverlay } from "@/src/shared/components/shell/navigation-pending"
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
import { Button, buttonVariants } from "@/src/shared/components/ui/button"

type ShortcutTone = "warning" | "danger" | "info" | "muted"

const TONE_CLASS: Record<ShortcutTone, string> = {
  warning: "text-warning",
  danger: "text-destructive",
  info: "text-info",
  muted: "text-muted-foreground",
}

/**
 * Atajo del hero: tarjeta clara con borde. No usa el relleno de `secondary`
 * porque en Estudio claro ese gris es el mismo color que la etiqueta, y el alto
 * fijo del botón recortaba la etiqueta.
 */
const SHORTCUT_TILE_CLASS =
  "relative h-auto flex-col items-center gap-1 bg-card py-3 dark:bg-card"

type SubscriptionsHeroProps = {
  monthlyCost: string
  annualCost: string
  activeCount: number
  byCurrency: readonly FinanceSubscriptionCurrencyCost[]
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
  byCurrency,
  baseCurrency,
  badges,
  loading,
  onUpcoming,
  onAlerts,
  onDetected,
}: SubscriptionsHeroProps) {
  const locale = useFormatLocale()
  const display = {
    currency: baseCurrency,
    showCents: false,
    compactNumbers: false,
    locale,
  }
  const onlyCurrency = byCurrency.length === 1 ? byCurrency[0] : null
  const nativeOnly =
    onlyCurrency && onlyCurrency.currency !== baseCurrency ? onlyCurrency : null
  const summaryDisplay = {
    ...display,
    currency: nativeOnly?.currency ?? baseCurrency,
  }
  const summaryMonthlyCost = nativeOnly?.monthlyCost ?? monthlyCost
  const summaryAnnualCost = nativeOnly?.annualCost ?? annualCost

  return (
    <section className="relative flex flex-col gap-4 overflow-hidden px-1 pt-2">
      <div className="flex flex-col items-center gap-1">
        <span className="flex items-center gap-2 text-base font-medium text-foreground">
          <RepeatIcon className="size-4 text-success" aria-hidden />
          Gasto mensual
        </span>
        {loading ? (
          <Skeleton className="h-10 w-40" />
        ) : byCurrency.length > 1 ? (
          <div className="grid w-full grid-cols-2 gap-2">
            {byCurrency.map((cost) => (
              <div
                key={cost.currency}
                className="flex flex-col items-center rounded-2xl bg-muted/50 px-2 py-1.5"
              >
                <span className="text-xs text-muted-foreground">
                  {cost.currency} · {cost.activeCount} activa
                  {cost.activeCount === 1 ? "" : "s"}
                </span>
                <span className="text-xl font-bold tabular-nums">
                  {formatFinanceMoney(cost.monthlyCost, {
                    ...display,
                    currency: cost.currency,
                  })}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {formatFinanceMoney(cost.annualCost, {
                    ...display,
                    currency: cost.currency,
                  })}{" "}
                  al año
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-4xl font-bold tracking-tight tabular-nums">
            {formatFinanceMoney(summaryMonthlyCost, summaryDisplay)}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          {byCurrency.length > 1
            ? "Cada moneda va por separado; no se convierten entre sí."
            : `${formatFinanceMoney(summaryAnnualCost, summaryDisplay)} al año · ${activeCount} activa${activeCount === 1 ? "" : "s"}`}
        </p>
      </div>

      <div className="my-4 flex items-center justify-center gap-2">
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
            buttonVariants({
              variant: "outline",
              className: SHORTCUT_TILE_CLASS,
            })
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
    <Button
      aria-label={label}
      onClick={onPress}
      variant="outline"
      className={cn(SHORTCUT_TILE_CLASS, PRESSABLE_CLASS)}
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
    </Button>
  )
}
