"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import { FinanceExpenseTrendBadge } from "@/src/modules/finance/shared/components/expense-trend-badge"
import { FinanceSegmentedControl } from "@/src/modules/finance/shared/components/forms/form-blocks"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import {
  FinanceRingChart,
  FinanceRingLegend,
} from "@/src/modules/finance/products/components/ring-chart"
import { RecurringArchiveSheet } from "@/src/modules/finance/subscriptions/components/recurring-archive-sheet"
import { SubscriptionCard } from "@/src/modules/finance/subscriptions/components/subscription-card"
import { SubscriptionSheet } from "@/src/modules/finance/subscriptions/components/subscription-sheet"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import {
  useRecurring,
  useUpdateRecurring,
} from "@/src/modules/finance/shared/hooks/use-recurring"
import {
  useCreateSubscription,
  useDismissSubscriptionAlert,
  useSubscriptionAlerts,
  useSubscriptionSummary,
  useSubscriptions,
  useSubscriptionsBreakdown,
  useSubscriptionsUpcoming,
} from "@/src/modules/finance/shared/hooks/use-subscriptions"
import { expenseTrend } from "@/src/modules/finance/shared/lib/finance-home-month"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import {
  monthKeyFromDate,
  isoMonthBounds,
  listYearMonths,
  type MonthKey,
} from "@/src/modules/finance/shared/lib/month-window"
import { weeksForMonth } from "@/src/modules/finance/shared/lib/calendar-weeks"
import {
  nextChargeLabel,
  recurringFrequencyLabel,
} from "@/src/modules/finance/subscriptions/lib/recurring-display"
import {
  alertOccurrenceLabel,
  breakdownFilter,
  buildSubscriptionSlices,
  groupSubscriptions,
  subscriptionListQuery,
  subscriptionPayloadFromPattern,
  upcomingByDay,
  SUBSCRIPTION_ALERT_LABEL,
  SUBSCRIPTION_BREAKDOWN_LABEL,
  type SubscriptionListFilter,
} from "@/src/modules/finance/subscriptions/lib/subscription-view"
import type { SubscriptionDraft } from "@/src/modules/finance/subscriptions/lib/subscription-form"
import { FinanceMonthPicker } from "@/src/modules/finance/transactions/components/month-picker"
import type {
  FinanceRecurringPattern,
  FinanceSubscriptionAlert,
  FinanceSubscriptionBreakdownAxis,
  FinanceSubscriptionPaymentMethod,
  FinanceSubscriptionStatus,
} from "@/src/modules/finance/shared/types/entities"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import { Badge } from "@/src/shared/components/ui/badge"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { InfiniteListSentinel } from "@/src/shared/components/ui/infinite-list-sentinel"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import {
  BellIcon,
  CalendarDaysIcon,
  CheckIcon,
  PlusIcon,
  RepeatIcon,
  SearchIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react"
import { useMemo, useRef, useState } from "react"

const STATUS_FILTER_OPTIONS: {
  value: "ALL" | FinanceSubscriptionStatus
  label: string
}[] = [
  { value: "ALL", label: "Todas" },
  { value: "ACTIVE", label: "Activas" },
  { value: "PAUSED", label: "Pausadas" },
]

const BREAKDOWN_OPTIONS: {
  value: FinanceSubscriptionBreakdownAxis
  label: string
}[] = [
  { value: "category", label: "Categoría" },
  { value: "instrument", label: "Método" },
  { value: "currency", label: "Moneda" },
]

export function SubscriptionsScreen() {
  return (
    <FinanceGate>
      <SubscriptionsScreenBody />
    </FinanceGate>
  )
}

function SubscriptionsScreenBody() {
  const { isEnabled, config } = useFinanceEnabled()
  const now = useMemo(() => new Date(), [])
  const display: FinanceMoneyDisplay = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }
  const [sheetOpen, setSheetOpen] = useState(false)
  const [subscriptionDraft, setSubscriptionDraft] =
    useState<SubscriptionDraft | null>(null)
  const [breakdownBy, setBreakdownBy] =
    useState<FinanceSubscriptionBreakdownAxis>("category")
  const [activeSlice, setActiveSlice] = useState<string | null>(null)
  const [upcomingView, setUpcomingView] = useState<"strip" | "calendar">(
    "strip"
  )
  const upcomingRef = useRef<HTMLDivElement>(null)
  const detectedRef = useRef<HTMLDivElement>(null)

  const summaryQuery = useSubscriptionSummary(isEnabled)
  const breakdownQuery = useSubscriptionsBreakdown(isEnabled, breakdownBy)
  const summary = summaryQuery.data
  const breakdownItems = breakdownQuery.data?.items ?? []
  const ringDisplay = {
    ...display,
    currency: breakdownQuery.data?.baseCurrency ?? display.currency,
  }
  const slices = buildSubscriptionSlices(breakdownItems, ringDisplay)
  const sliceFilter = activeSlice
    ? breakdownFilter(breakdownBy, activeSlice)
    : null
  const activeSliceLabel = activeSlice
    ? (breakdownItems.find((item) => item.key === activeSlice)?.label ?? null)
    : null

  function openCreate(draft: SubscriptionDraft | null = null) {
    setSubscriptionDraft(draft)
    setSheetOpen(true)
  }

  function toggleSlice(key: string) {
    setActiveSlice((current) => (current === key ? null : key))
  }

  function openCalendar() {
    setUpcomingView("calendar")
    upcomingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const trend = summary
    ? expenseTrend(summary.monthlyCost, summary.previousMonthlyCost)
    : null

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-3xl border border-border bg-card p-5">
        <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
          Gasto en suscripciones
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <p className="text-4xl font-bold tracking-tight tabular-nums">
            {summary ? formatFinanceMoney(summary.monthlyCost, display) : "…"}
          </p>
          {trend ? <FinanceExpenseTrendBadge trend={trend} /> : null}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {summary
            ? `${formatFinanceMoney(summary.annualCost, display)} al año · ${summary.activeCount} activa${summary.activeCount === 1 ? "" : "s"}`
            : "Cargando resumen…"}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" onClick={() => openCreate()}>
            <PlusIcon className="size-4 shrink-0" />
            Nueva
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              detectedRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })
            }
          >
            <SparklesIcon className="size-4 shrink-0" />
            Por confirmar
            {summary && summary.pendingDetectedCount > 0 ? (
              <Badge variant="warning">{summary.pendingDetectedCount}</Badge>
            ) : null}
          </Button>
          <Button type="button" variant="outline" onClick={openCalendar}>
            <CalendarDaysIcon className="size-4 shrink-0" />
            Calendario
          </Button>
        </div>
      </section>

      {summaryQuery.isError ? (
        <FinanceErrorState
          message={financeErrorMessage(summaryQuery.error)}
          onRetry={() => void summaryQuery.refetch()}
          isRetrying={summaryQuery.isFetching}
        />
      ) : null}

      <section className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Distribución del gasto</h2>
        </div>
        <FinanceSegmentedControl
          label="Ver por"
          value={breakdownBy}
          onChange={(value) => {
            setBreakdownBy(value)
            setActiveSlice(null)
          }}
          options={BREAKDOWN_OPTIONS}
          fullWidth
        />
        {breakdownQuery.isError ? (
          <FinanceErrorState
            message={financeErrorMessage(breakdownQuery.error)}
            onRetry={() => void breakdownQuery.refetch()}
            isRetrying={breakdownQuery.isFetching}
          />
        ) : null}
        <AsyncRegion
          pending={breakdownQuery.isPending && !breakdownQuery.data}
          pendingFallback={<FinanceListSkeleton />}
          empty={slices.length === 0}
          emptyFallback={
            <p className="py-4 text-center text-sm text-muted-foreground">
              Sin suscripciones activas que repartir.
            </p>
          }
        >
          <div className="flex items-center gap-3 sm:gap-6">
            <FinanceRingChart
              slices={slices}
              activeKey={activeSlice}
              onSelect={toggleSlice}
              centerLabel={SUBSCRIPTION_BREAKDOWN_LABEL[breakdownBy]}
              centerValue={formatFinanceMoney(
                summary?.monthlyCost ?? "0",
                display
              )}
              centerDebt={null}
              className="w-2/5 shrink-0 sm:w-40"
            />
            <FinanceRingLegend
              slices={slices}
              activeKey={activeSlice}
              onSelect={toggleSlice}
              className="min-w-0 flex-1"
            />
          </div>
        </AsyncRegion>
      </section>

      <div ref={upcomingRef}>
        <UpcomingSection
          isEnabled={isEnabled}
          display={display}
          now={now}
          view={upcomingView}
          onViewChange={setUpcomingView}
        />
      </div>

      <AlertsSection isEnabled={isEnabled} display={display} />

      <ManagedList
        isEnabled={isEnabled}
        display={display}
        now={now}
        groupBy={config.subscriptions.groupBy}
        filter={sliceFilter}
        filterLabel={activeSliceLabel}
        onClearFilter={() => setActiveSlice(null)}
      />

      <div ref={detectedRef}>
        <DetectedTray isEnabled={isEnabled} display={display} />
      </div>

      <CancelledFooter
        isEnabled={isEnabled}
        display={display}
        savings={summary?.cancelledAnnualSavings ?? "0"}
      />

      <SubscriptionSheet
        open={sheetOpen}
        onOpenChange={(next) => {
          setSheetOpen(next)
          if (!next) {
            setSubscriptionDraft(null)
          }
        }}
        subscription={null}
        draft={subscriptionDraft ?? undefined}
        display={display}
        defaultReminderDays={config.subscriptions.reminderDaysBefore}
      />
    </div>
  )
}

function methodLabel(method: FinanceSubscriptionPaymentMethod | null): string {
  if (!method) {
    return "Sin método"
  }
  const last4 = method.last4 ? ` ••${method.last4}` : ""
  return `${method.name}${last4}`
}

type UpcomingSectionProps = {
  isEnabled: boolean
  display: FinanceMoneyDisplay
  now: Date
  view: "strip" | "calendar"
  onViewChange: (view: "strip" | "calendar") => void
}

function UpcomingSection({
  isEnabled,
  display,
  now,
  view,
  onViewChange,
}: UpcomingSectionProps) {
  const [month, setMonth] = useState<MonthKey>(monthKeyFromDate(now))
  const [monthDate] = useState(now)
  const stripQuery = useSubscriptionsUpcoming(isEnabled, { days: 30 })
  const bounds = useMemo(() => {
    const [year, monthNumber] = month.split("-").map(Number)
    return isoMonthBounds(year ?? 0, monthNumber ?? 1)
  }, [month])
  const calendarQuery = useSubscriptionsUpcoming(
    isEnabled && view === "calendar",
    { from: bounds.dateFrom, to: bounds.dateTo }
  )
  const months = useMemo(
    () =>
      listYearMonths(
        new Date(monthDate.getFullYear(), monthDate.getMonth() - 6, 1),
        new Date(monthDate.getFullYear(), monthDate.getMonth() + 6, 1)
      ),
    [monthDate]
  )
  const charges = view === "calendar" ? (calendarQuery.data?.items ?? []) : []
  const chargesByDay = upcomingByDay(charges)
  const [activeYear, activeMonth] = month.split("-").map(Number)

  return (
    <section className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Próximos cobros</h2>
        <FinanceSegmentedControl
          value={view}
          onChange={onViewChange}
          options={[
            { value: "strip", label: "30 días" },
            { value: "calendar", label: "Calendario" },
          ]}
        />
      </div>

      {view === "strip" ? (
        <>
          {stripQuery.isError ? (
            <FinanceErrorState
              message={financeErrorMessage(stripQuery.error)}
              onRetry={() => void stripQuery.refetch()}
              isRetrying={stripQuery.isFetching}
            />
          ) : null}
          <AsyncRegion
            pending={stripQuery.isPending && !stripQuery.data}
            pendingFallback={<FinanceListSkeleton />}
            empty={(stripQuery.data?.items.length ?? 0) === 0}
            emptyFallback={
              <p className="py-4 text-center text-sm text-muted-foreground">
                Sin cobros en los próximos 30 días.
              </p>
            }
          >
            <div className="flex snap-x snap-mandatory scrollbar-none gap-3 overflow-x-auto pb-1">
              {(stripQuery.data?.items ?? []).map((charge) => (
                <div
                  key={charge.id}
                  className="flex w-40 shrink-0 snap-start flex-col gap-2 rounded-2xl border border-border bg-background p-3"
                >
                  <BrandLogo
                    name={charge.name}
                    logoUrl={charge.logoUrl}
                    size={32}
                  />
                  <p className="truncate text-sm font-medium">{charge.name}</p>
                  <p className="text-sm font-semibold tabular-nums">
                    {formatFinanceMoney(charge.amount, {
                      ...display,
                      currency: charge.currency,
                    })}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {methodLabel(charge.paymentMethod)}
                  </p>
                  <Badge variant="info">
                    {nextChargeLabel(charge.daysUntil)}
                  </Badge>
                </div>
              ))}
            </div>
          </AsyncRegion>
        </>
      ) : (
        <div className="flex flex-col gap-3">
          <FinanceMonthPicker
            months={months}
            activeMonthKey={month}
            currentMonthKey={monthKeyFromDate(now)}
            onSelect={setMonth}
          />
          {calendarQuery.isError ? (
            <FinanceErrorState
              message={financeErrorMessage(calendarQuery.error)}
              onRetry={() => void calendarQuery.refetch()}
              isRetrying={calendarQuery.isFetching}
            />
          ) : null}
          <div className="flex flex-col gap-2">
            {weeksForMonth(activeYear ?? 0, activeMonth ?? 1).map((week) => (
              <div
                key={week.id}
                className="rounded-2xl border border-border/70 p-2"
              >
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  {week.label}
                </p>
                <div className="flex flex-wrap gap-1">
                  {[...chargesByDay.entries()]
                    .filter(([date]) => {
                      const value = new Date(`${date}T00:00:00`)
                      return value >= week.start && value <= week.end
                    })
                    .flatMap(([, dayCharges]) => dayCharges)
                    .map((charge) => (
                      <span
                        key={charge.id}
                        className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
                      >
                        <BrandLogo
                          name={charge.name}
                          logoUrl={charge.logoUrl}
                          size={14}
                        />
                        {charge.date.slice(8)} · {charge.name}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

type AlertsSectionProps = {
  isEnabled: boolean
  display: FinanceMoneyDisplay
}

function AlertsSection({ isEnabled, display }: AlertsSectionProps) {
  const alertsQuery = useSubscriptionAlerts(isEnabled)
  const dismissMutation = useDismissSubscriptionAlert()
  const alerts = alertsQuery.data ?? []

  async function dismiss(alert: FinanceSubscriptionAlert) {
    try {
      await dismissMutation.mutateAsync({
        kind: alert.kind,
        subscriptionId: alert.subscriptionId,
        alertDate: alert.date,
      })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  if (alertsQuery.isError) {
    return (
      <FinanceErrorState
        message={financeErrorMessage(alertsQuery.error)}
        onRetry={() => void alertsQuery.refetch()}
        isRetrying={alertsQuery.isFetching}
      />
    )
  }

  if (alerts.length === 0) {
    return null
  }

  return (
    <SummarySection title="Alertas" icon={BellIcon}>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="flex items-center gap-3 rounded-2xl bg-muted/40 px-3 py-2"
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">
              {alertTitle(alert, display)}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {SUBSCRIPTION_ALERT_LABEL[alert.kind]} ·{" "}
              {alertOccurrenceLabel(alert)}
            </span>
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Descartar alerta"
            disabled={dismissMutation.isPending}
            onClick={() => void dismiss(alert)}
          >
            <XIcon className="size-4" />
          </Button>
        </div>
      ))}
    </SummarySection>
  )
}

function alertTitle(
  alert: FinanceSubscriptionAlert,
  display: FinanceMoneyDisplay
): string {
  if (alert.kind === "PRICE_INCREASE") {
    return `${alert.subscriptionName} subió ${alert.percent ?? 0} %`
  }
  if (alert.kind === "TRIAL_ENDING") {
    return `La prueba de ${alert.subscriptionName} está por terminar`
  }
  if (alert.kind === "ANNUAL_RENEWAL") {
    return `${alert.subscriptionName} se renueva pronto`
  }
  if (alert.amount) {
    return `${alert.subscriptionName}: cobro de ${formatFinanceMoney(
      alert.amount,
      {
        ...display,
        currency: alert.currency,
      }
    )} sin registrar`
  }
  return `${alert.subscriptionName}: cobro sin registrar`
}

type ManagedListProps = {
  isEnabled: boolean
  display: FinanceMoneyDisplay
  now: Date
  groupBy: "category" | "provider" | "none"
  filter: SubscriptionListFilter | null
  filterLabel: string | null
  onClearFilter: () => void
}

function ManagedList({
  isEnabled,
  display,
  now,
  groupBy,
  filter,
  filterLabel,
  onClearFilter,
}: ManagedListProps) {
  const [status, setStatus] = useState<"ALL" | FinanceSubscriptionStatus>("ALL")
  const [currency, setCurrency] = useState("ALL")
  const [search, setSearch] = useState("")
  const listQuery = useSubscriptions(
    isEnabled,
    subscriptionListQuery({ filter, status, currency, search })
  )
  const items = infiniteListItems(listQuery.data)
  const currencyOptions = useMemo(() => {
    const codes = new Set<string>([display.currency])
    for (const item of items) {
      codes.add(item.currency)
    }
    return [
      { value: "ALL", label: "Todas" },
      ...[...codes].map((code) => ({ value: code, label: code })),
    ]
  }, [items, display.currency])
  const groups = useMemo(
    () => groupSubscriptions(items, groupBy),
    [items, groupBy]
  )

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Mis suscripciones</h2>
        {filterLabel ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearFilter}
          >
            <XIcon className="size-4 shrink-0" />
            {filterLabel}
          </Button>
        ) : null}
      </div>

      <FinanceSegmentedControl
        label="Estado"
        value={status}
        onChange={setStatus}
        options={STATUS_FILTER_OPTIONS}
        fullWidth
      />

      {!filter?.currency && currencyOptions.length > 2 ? (
        <FinanceSegmentedControl
          label="Moneda"
          value={currency}
          onChange={setCurrency}
          options={currencyOptions}
          fullWidth
        />
      ) : null}

      <FormTextField
        label="Buscar"
        icon={SearchIcon}
        value={search}
        onChange={setSearch}
        placeholder="Netflix, Spotify…"
      />

      {listQuery.isError ? (
        <FinanceErrorState
          message={financeErrorMessage(listQuery.error)}
          onRetry={() => void listQuery.refetch()}
          isRetrying={listQuery.isFetching}
        />
      ) : null}

      <AsyncRegion
        pending={listQuery.isPending && !listQuery.data}
        pendingFallback={<FinanceListSkeleton />}
        empty={items.length === 0}
        emptyFallback={
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <RepeatIcon />
              </EmptyMedia>
              <EmptyTitle>Sin suscripciones</EmptyTitle>
              <EmptyDescription>
                Crea una a mano o confirma un cobro detectado.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        }
      >
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <div key={group.key} className="flex flex-col gap-2">
              {groupBy !== "none" ? (
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {group.label}
                </p>
              ) : null}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {group.items.map((subscription) => (
                  <SubscriptionCard
                    key={subscription.id}
                    subscription={subscription}
                    display={display}
                    now={now}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </AsyncRegion>

      <InfiniteListSentinel
        hasNextPage={listQuery.hasNextPage}
        isFetchingNextPage={listQuery.isFetchingNextPage}
        onLoadMore={() => void listQuery.fetchNextPage()}
      />
    </section>
  )
}

type DetectedTrayProps = {
  isEnabled: boolean
  display: FinanceMoneyDisplay
}

function DetectedTray({ isEnabled, display }: DetectedTrayProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const recurringQuery = useRecurring(isEnabled, "SUGGESTED")
  const updateMutation = useUpdateRecurring()
  const createMutation = useCreateSubscription()
  const items = infiniteListItems(recurringQuery.data)

  async function confirm(pattern: FinanceRecurringPattern) {
    setConfirmingId(pattern.id)
    try {
      await createMutation.mutateAsync(subscriptionPayloadFromPattern(pattern))
      await updateMutation.mutateAsync({
        id: pattern.id,
        body: { status: "CONFIRMED" },
      })
      appToast.success({ text1: `${pattern.merchantName} es suscripción` })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    } finally {
      setConfirmingId(null)
    }
  }

  async function dismiss(pattern: FinanceRecurringPattern) {
    try {
      await updateMutation.mutateAsync({
        id: pattern.id,
        body: { status: "DISMISSED" },
      })
      appToast.success({ text1: "Descartado" })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  return (
    <>
      <section className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">
          Detectados por confirmar ({items.length})
        </h2>
        {recurringQuery.isError ? (
          <FinanceErrorState
            message={financeErrorMessage(recurringQuery.error)}
            onRetry={() => void recurringQuery.refetch()}
            isRetrying={recurringQuery.isFetching}
          />
        ) : null}
        <AsyncRegion
          pending={recurringQuery.isPending && !recurringQuery.data}
          pendingFallback={<FinanceListSkeleton />}
          empty={items.length === 0}
          emptyFallback={
            <p className="py-4 text-center text-sm text-muted-foreground">
              No hay cobros repetidos por confirmar.
            </p>
          }
        >
          <div className="flex flex-col gap-2">
            {items.map((pattern) => (
              <div
                key={pattern.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3"
              >
                <BrandLogo
                  name={pattern.merchantName}
                  logoUrl={pattern.logoUrl}
                  size={36}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {pattern.merchantName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatFinanceMoney(pattern.avgAmount, {
                      ...display,
                      currency: pattern.currency,
                    })}{" "}
                    · {recurringFrequencyLabel(pattern.frequency).toLowerCase()}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  disabled={confirmingId === pattern.id}
                  onClick={() => void confirm(pattern)}
                >
                  {confirmingId === pattern.id ? (
                    <Spinner className="size-4" />
                  ) : (
                    <CheckIcon className="size-4 shrink-0" />
                  )}
                  Confirmar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={updateMutation.isPending}
                  onClick={() => void dismiss(pattern)}
                >
                  <XIcon className="size-4 shrink-0" />
                </Button>
              </div>
            ))}
          </div>
        </AsyncRegion>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setSheetOpen(true)}
        >
          Ver bandeja completa
        </Button>
      </section>

      <RecurringArchiveSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        display={display}
      />
    </>
  )
}

type CancelledFooterProps = {
  isEnabled: boolean
  display: FinanceMoneyDisplay
  savings: string
}

function CancelledFooter({
  isEnabled,
  display,
  savings,
}: CancelledFooterProps) {
  const [open, setOpen] = useState(false)
  const listQuery = useSubscriptions(isEnabled && open, {
    status: "CANCELLED",
  })
  const items = infiniteListItems(listQuery.data)

  return (
    <section className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-4">
      <button
        type="button"
        className="flex items-center justify-between gap-2 text-left"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="text-sm font-semibold">Canceladas</span>
        <span className="text-sm text-muted-foreground">
          Ahorras {formatFinanceMoney(savings, display)} al año
        </span>
      </button>
      {open ? (
        <div className="flex flex-col gap-2">
          {items.map((subscription) => (
            <div
              key={subscription.id}
              className="flex items-center gap-3 text-sm text-muted-foreground"
            >
              <BrandLogo
                name={subscription.name}
                logoUrl={subscription.logoUrl}
                size={28}
              />
              <span className="min-w-0 flex-1 truncate">
                {subscription.name}
              </span>
              <span className="tabular-nums">
                {formatFinanceMoney(subscription.annualEquivalent, {
                  ...display,
                  currency: subscription.currency,
                })}{" "}
                /año
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
