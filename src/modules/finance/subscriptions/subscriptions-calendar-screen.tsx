"use client"

import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import {
  useSubscriptionSummary,
  useSubscriptionsBreakdown,
  useSubscriptionsUpcoming,
} from "@/src/modules/finance/shared/hooks/use-subscriptions"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import {
  isoMonthBounds,
  listYearMonths,
  monthKeyFromDate,
  parseMonthKey,
  type MonthKey,
} from "@/src/modules/finance/shared/lib/month-window"
import { FinanceRingChart } from "@/src/modules/finance/products/components/ring-chart"
import { SubscriptionCard } from "@/src/modules/finance/subscriptions/components/subscription-card"
import { upcomingChargeToCardSource } from "@/src/modules/finance/subscriptions/lib/subscription-card-source"
import { buildSubscriptionSlices } from "@/src/modules/finance/subscriptions/lib/subscription-view"
import {
  subscriptionCalendarWeeks,
  subscriptionMonthLabel,
  subscriptionChargeSummary,
  subscriptionChargeSummaryLabel,
  subscriptionRestOfMonth,
} from "@/src/modules/finance/subscriptions/lib/subscription-calendar"
import { FinanceMonthPicker } from "@/src/modules/finance/transactions/components/month-picker"
import { useWeekStartsOn } from "@/src/modules/settings/hooks/use-week-starts-on"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { cn } from "@/src/shared/lib/utils"
import { CalendarDaysIcon, CalendarOffIcon, TagsIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

const WEEKDAY_INITIALS = ["L", "M", "X", "J", "V", "S", "D"] as const
const MONTH_CALENDAR_RADIUS = 6
const NO_SLICE: string | null = null

export function SubscriptionsCalendarScreen() {
  return (
    <FinanceGate>
      <SubscriptionsCalendarBody />
    </FinanceGate>
  )
}

function SubscriptionsCalendarBody() {
  const router = useRouter()
  const { isEnabled, config, formatLocale } = useFinanceEnabled()
  const [today] = useState(() => new Date())
  const [month, setMonth] = useState<MonthKey>(monthKeyFromDate(today))
  const windowDays = config.subscriptions.reminderDaysBefore
  const weekStartsOn = useWeekStartsOn(config.weekStartsOn)
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
    locale: formatLocale,
  }

  usePageHeader({
    variant: "secondary",
    title: "Calendario",
    onBack: () => router.back(),
  })

  const parsedMonth = useMemo(() => parseMonthKey(month), [month])
  const bounds = useMemo(
    () => isoMonthBounds(parsedMonth.year, parsedMonth.month),
    [parsedMonth]
  )
  const chargesQuery = useSubscriptionsUpcoming(isEnabled, {
    from: bounds.dateFrom,
    to: bounds.dateTo,
  })
  const breakdownQuery = useSubscriptionsBreakdown(isEnabled, "category")
  const summaryQuery = useSubscriptionSummary(isEnabled)
  const charges = useMemo(
    () => chargesQuery.data?.items ?? [],
    [chargesQuery.data]
  )
  const chargesReady = chargesQuery.isPending && !chargesQuery.data
  const weeks = useMemo(
    () =>
      subscriptionCalendarWeeks({
        year: parsedMonth.year,
        month: parsedMonth.month,
        charges,
        today,
        windowDays,
        weekStartsOn,
      }),
    [parsedMonth, charges, today, windowDays, weekStartsOn]
  )
  const summaryLabel = subscriptionChargeSummaryLabel({
    locale: formatLocale,
    summary: subscriptionChargeSummary({
      charges,
      baseCurrency: display.currency,
    }),
    showCents: display.showCents,
  })
  const restOfMonth = subscriptionRestOfMonth(charges, today)
  const slices = buildSubscriptionSlices(
    breakdownQuery.data?.items ?? [],
    display
  )
  const months = useMemo(
    () =>
      listYearMonths(
        new Date(
          today.getFullYear(),
          today.getMonth() - MONTH_CALENDAR_RADIUS,
          1
        ),
        new Date(
          today.getFullYear(),
          today.getMonth() + MONTH_CALENDAR_RADIUS,
          1
        )
      ),
    [today]
  )

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <div className="flex flex-col items-center gap-1">
          <p className="text-lg font-semibold">
            {subscriptionMonthLabel({
              year: parsedMonth.year,
              month: parsedMonth.month,
            })}
          </p>
          <p className="text-sm text-muted-foreground">{summaryLabel}</p>
        </div>
        <FinanceMonthPicker
          months={months}
          activeMonthKey={month}
          currentMonthKey={monthKeyFromDate(today)}
          onSelect={setMonth}
        />
        {chargesQuery.isError ? (
          <FinanceErrorState
            message={financeErrorMessage(chargesQuery.error)}
            onRetry={() => void chargesQuery.refetch()}
            isRetrying={chargesQuery.isFetching}
          />
        ) : null}
        <AsyncRegion
          pending={chargesReady}
          pendingFallback={<FinanceListSkeleton rows={6} />}
          empty={false}
          emptyFallback={null}
        >
          <div className="overflow-hidden rounded-2xl border border-border bg-card p-3">
            <div className="grid grid-cols-7 gap-1 pb-2">
              {WEEKDAY_INITIALS.map((initial) => (
                <span
                  key={initial}
                  className="text-center text-xs text-muted-foreground"
                >
                  {initial}
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              {weeks.map((week) => (
                <div key={week.id} className="grid grid-cols-7 gap-1">
                  {week.days.map((day) => (
                    <div
                      key={day.date}
                      className={cn(
                        "flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-xs",
                        day.isToday && "bg-primary/15",
                        !day.isToday && day.inWindow && "bg-warning/15"
                      )}
                    >
                      {day.dayNumber === null ? null : (
                        <>
                          <span
                            className={cn(
                              "tabular-nums",
                              day.isToday && "font-semibold text-primary"
                            )}
                          >
                            {day.dayNumber}
                          </span>
                          <span className="flex gap-0.5">
                            {day.charges.slice(0, 2).map((charge) => (
                              <BrandLogo
                                key={charge.id}
                                name={charge.name}
                                logoUrl={charge.logoUrl}
                                size={14}
                              />
                            ))}
                          </span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="size-3 rounded-full bg-primary" aria-hidden />
                Hoy
              </span>
              <span className="flex items-center gap-1">
                <span
                  className="size-3 rounded-full bg-warning/40"
                  aria-hidden
                />
                Ventana de aviso ({windowDays} días)
              </span>
            </div>
          </div>
        </AsyncRegion>
      </section>

      <SummarySection title="Restante del mes" icon={CalendarDaysIcon}>
        {restOfMonth.length === 0 ? (
          <Empty className="py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarOffIcon />
              </EmptyMedia>
              <EmptyTitle>Sin cobros por delante</EmptyTitle>
              <EmptyDescription>
                No quedan cargos este mes para las suscripciones activas.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          restOfMonth.map((charge) => (
            <SubscriptionCard
              key={charge.id}
              subscription={upcomingChargeToCardSource(charge)}
              display={display}
              today={today}
              windowDays={windowDays}
              variant="compact"
            />
          ))
        )}
      </SummarySection>

      <SummarySection title="Distribución por categoría" icon={TagsIcon}>
        {breakdownQuery.isError ? (
          <FinanceErrorState
            message={financeErrorMessage(breakdownQuery.error)}
            onRetry={() => void breakdownQuery.refetch()}
            isRetrying={breakdownQuery.isFetching}
          />
        ) : null}
        {summaryQuery.isError ? (
          <FinanceErrorState
            message={financeErrorMessage(summaryQuery.error)}
            onRetry={() => void summaryQuery.refetch()}
            isRetrying={summaryQuery.isFetching}
          />
        ) : null}
        <AsyncRegion
          pending={breakdownQuery.isPending && !breakdownQuery.data}
          pendingFallback={<FinanceListSkeleton rows={3} />}
          empty={slices.length === 0}
          emptyFallback={
            <Empty className="py-6">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <TagsIcon />
                </EmptyMedia>
                <EmptyTitle>Sin suscripciones activas</EmptyTitle>
                <EmptyDescription>
                  No hay gasto que repartir por categoría.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          }
        >
          <div className="flex items-center gap-3 sm:gap-6">
            <FinanceRingChart
              slices={slices}
              activeKey={NO_SLICE}
              onSelect={() => undefined}
              centerLabel="Al mes"
              centerValue={formatFinanceMoney(
                summaryQuery.data?.monthlyCost ?? "0",
                display
              )}
              centerDebt={null}
              className="w-2/5 shrink-0 sm:w-40"
            />
            <ul className="flex min-w-0 flex-1 flex-col gap-1">
              {slices.map((slice) => (
                <li
                  key={slice.key}
                  className="flex min-w-0 items-center gap-2 text-sm"
                >
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: slice.color }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate">{slice.name}</span>
                  <span className="shrink-0 text-muted-foreground tabular-nums">
                    {slice.percentLabel}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </AsyncRegion>
      </SummarySection>
    </div>
  )
}
