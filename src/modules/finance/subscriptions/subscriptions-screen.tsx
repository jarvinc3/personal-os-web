"use client"

import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useCards } from "@/src/modules/finance/shared/hooks/use-cards"
import { useCategories } from "@/src/modules/finance/shared/hooks/use-categories"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import {
  useSubscriptionAlerts,
  useSubscriptionSummary,
  useSubscriptions,
} from "@/src/modules/finance/shared/hooks/use-subscriptions"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { AlertsSheet } from "@/src/modules/finance/subscriptions/components/alerts-sheet"
import { DetectedSheet } from "@/src/modules/finance/subscriptions/components/detected-sheet"
import { SubscriptionCard } from "@/src/modules/finance/subscriptions/components/subscription-card"
import { SubscriptionFiltersSheet } from "@/src/modules/finance/subscriptions/components/subscription-filters-sheet"
import { SubscriptionSheet } from "@/src/modules/finance/subscriptions/components/subscription-sheet"
import { SubscriptionsHero } from "@/src/modules/finance/subscriptions/components/subscriptions-hero"
import { UpcomingSheet } from "@/src/modules/finance/subscriptions/components/upcoming-sheet"
import {
  activeSubscriptionFilterCount,
  clearSubscriptionFilter,
  subscriptionFilterChips,
  subscriptionFiltersFromSearchParams,
  subscriptionListQuery,
  subscriptionMethodLabel,
  withSubscriptionFilters,
  type SubscriptionFilters,
} from "@/src/modules/finance/subscriptions/lib/subscription-filters"
import { subscriptionShortcutBadges } from "@/src/modules/finance/subscriptions/lib/subscription-display"
import { groupSubscriptions } from "@/src/modules/finance/subscriptions/lib/subscription-view"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { Badge } from "@/src/shared/components/ui/badge"
import { Button } from "@/src/shared/components/ui/button"
import { Fab } from "@/src/shared/components/layout/fab"
import { InfiniteListSentinel } from "@/src/shared/components/ui/infinite-list-sentinel"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { cn } from "@/src/shared/lib/utils"
import {
  RepeatIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  XIcon,
} from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"

export function SubscriptionsScreen() {
  return (
    <FinanceGate>
      <SubscriptionsScreenBody />
    </FinanceGate>
  )
}

function SubscriptionsScreenBody() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isEnabled, config } = useFinanceEnabled()
  const [today] = useState(() => new Date())
  const [createOpen, setCreateOpen] = useState(false)
  const filters = useMemo(
    () => subscriptionFiltersFromSearchParams(searchParams),
    [searchParams]
  )
  const display: FinanceMoneyDisplay = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }

  const upcomingSheet = useSheetParam(FINANCE_SHEET_KEYS.subscriptionUpcoming)
  const alertsSheet = useSheetParam(FINANCE_SHEET_KEYS.subscriptionAlerts)
  const detectedSheet = useSheetParam(FINANCE_SHEET_KEYS.subscriptionDetected)
  const filtersSheet = useSheetParam(FINANCE_SHEET_KEYS.subscriptionFilters)

  const summaryQuery = useSubscriptionSummary(isEnabled)
  const alertsQuery = useSubscriptionAlerts(isEnabled)
  const listQuery = useSubscriptions(isEnabled, subscriptionListQuery(filters))
  const accountsQuery = useAccounts(isEnabled)
  const cardsQuery = useCards(isEnabled)
  const institutionsQuery = useInstitutions(isEnabled)
  const categoriesQuery = useCategories(filtersSheet.open)

  const accounts = accountsQuery.data ?? []
  const cards = cardsQuery.data ?? []
  const institutions = institutionsQuery.data ?? []
  const categories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data]
  )
  const items = infiniteListItems(listQuery.data)
  const summary = summaryQuery.data
  const windowDays =
    summary?.reminderWindowDays ?? config.subscriptions.reminderDaysBefore
  const badges = subscriptionShortcutBadges({
    summary,
    alertCount: alertsQuery.data?.length ?? 0,
  })
  const categoryLabels = useMemo(
    () => Object.fromEntries(categories.map((item) => [item.id, item.name])),
    [categories]
  )
  const methodLabel = subscriptionMethodLabel({
    method: filters.method,
    accounts,
    cards,
  })
  const chips = subscriptionFilterChips({
    filters,
    methodLabel,
    categoryLabels,
  })
  const activeFilterCount = activeSubscriptionFilterCount(filters)
  const groups = useMemo(
    () => groupSubscriptions(items, config.subscriptions.groupBy),
    [items, config.subscriptions.groupBy]
  )

  usePageHeader({ variant: "primary", title: "Suscripciones" })

  function applyFilters(next: SubscriptionFilters) {
    const query = withSubscriptionFilters(searchParams.toString(), next)
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <SubscriptionsHero
        monthlyCost={summary?.monthlyCost ?? "0"}
        annualCost={summary?.annualCost ?? "0"}
        activeCount={summary?.activeCount ?? 0}
        baseCurrency={summary?.baseCurrency ?? display.currency}
        badges={badges}
        loading={summaryQuery.isPending && !summary}
        onUpcoming={() => upcomingSheet.setOpen(true)}
        onAlerts={() => alertsSheet.setOpen(true)}
        onDetected={() => detectedSheet.setOpen(true)}
      />

      {summaryQuery.isError ? (
        <FinanceErrorState
          message={financeErrorMessage(summaryQuery.error)}
          onRetry={() => void summaryQuery.refetch()}
          isRetrying={summaryQuery.isFetching}
        />
      ) : null}

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-baseline gap-2 text-sm font-semibold">
            Mis suscripciones
            <span className="text-sm font-normal text-muted-foreground tabular-nums">
              {items.length}
            </span>
          </h2>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Buscar suscripción"
              onClick={() => filtersSheet.setOpen(true)}
            >
              <SearchIcon className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Filtros"
              className="relative"
              onClick={() => filtersSheet.setOpen(true)}
            >
              <SlidersHorizontalIcon className="size-4" />
              {activeFilterCount > 0 ? (
                <Badge
                  variant="info"
                  className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1"
                >
                  {activeFilterCount}
                </Badge>
              ) : null}
            </Button>
          </div>
        </div>

        {chips.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {chips.map((chip) => (
              <Button
                key={`${chip.key}-${chip.categoryId ?? ""}`}
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  applyFilters(clearSubscriptionFilter(filters, chip))
                }
              >
                {chip.label}
                <XIcon className="size-3.5 shrink-0" />
              </Button>
            ))}
          </div>
        ) : null}

        {listQuery.isError ? (
          <FinanceErrorState
            message={financeErrorMessage(listQuery.error)}
            onRetry={() => void listQuery.refetch()}
            isRetrying={listQuery.isFetching}
          />
        ) : null}

        <AsyncRegion
          pending={listQuery.isPending && !listQuery.data}
          pendingFallback={<FinanceListSkeleton rows={4} />}
          empty={items.length === 0}
          emptyFallback={
            <Empty className="py-8">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <RepeatIcon />
                </EmptyMedia>
                <EmptyTitle>
                  {activeFilterCount > 0
                    ? "Ningún resultado"
                    : "Sin suscripciones"}
                </EmptyTitle>
                <EmptyDescription>
                  {activeFilterCount > 0
                    ? "Ninguna suscripción cumple estos filtros."
                    : "Crea una a mano o confirma un cobro detectado."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          }
        >
          <div className="flex flex-col gap-4">
            {groups.map((group) => (
              <div key={group.key} className="flex flex-col gap-2">
                {config.subscriptions.groupBy !== "none" ? (
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {group.label}
                  </p>
                ) : null}
                <div
                  className={cn(
                    "grid grid-cols-1 gap-3",
                    items.length > 1 && "md:grid-cols-2"
                  )}
                >
                  {group.items.map((subscription) => (
                    <SubscriptionCard
                      key={subscription.id}
                      subscription={subscription}
                      display={display}
                      today={today}
                      windowDays={windowDays}
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

      <Fab label="Nueva suscripción" onClick={() => setCreateOpen(true)} />

      <SubscriptionSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        subscription={null}
        display={display}
      />

      <UpcomingSheet
        open={upcomingSheet.open}
        onOpenChange={upcomingSheet.setOpen}
        isEnabled={isEnabled}
        display={display}
        today={today}
        windowDays={windowDays}
      />

      <AlertsSheet
        open={alertsSheet.open}
        onOpenChange={alertsSheet.setOpen}
        isEnabled={isEnabled}
        display={display}
      />

      <DetectedSheet
        open={detectedSheet.open}
        onOpenChange={detectedSheet.setOpen}
        isEnabled={isEnabled}
        display={display}
      />

      <SubscriptionFiltersSheet
        open={filtersSheet.open}
        onOpenChange={filtersSheet.setOpen}
        filters={filters}
        onChange={applyFilters}
        accounts={accounts}
        cards={cards}
        institutions={institutions}
        display={display}
        resultCount={items.length}
        hasMore={Boolean(listQuery.hasNextPage)}
        error={listQuery.error}
        isRetrying={listQuery.isFetching}
        onRetry={() => void listQuery.refetch()}
      />
    </div>
  )
}
