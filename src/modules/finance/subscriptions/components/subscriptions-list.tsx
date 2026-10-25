"use client"

import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { ListSkeleton } from "@/src/shared/components/feedback/list-skeleton"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useCards } from "@/src/modules/finance/shared/hooks/use-cards"
import { useCategories } from "@/src/modules/finance/shared/hooks/use-categories"
import { useSubscriptions } from "@/src/modules/finance/shared/hooks/use-subscriptions"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { SubscriptionCard } from "@/src/modules/finance/subscriptions/components/subscription-card"
import {
  activeSubscriptionFilterCount,
  clearSubscriptionFilter,
  subscriptionFilterChips,
  subscriptionListQuery,
  subscriptionMethodLabel,
  type SubscriptionFilters,
} from "@/src/modules/finance/subscriptions/lib/subscription-filters"
import { groupSubscriptions } from "@/src/modules/finance/subscriptions/lib/subscription-view"
import type { FinanceSubscriptionGroupBy } from "@/src/modules/finance/shared/types/entities"
import { Badge } from "@/src/shared/components/ui/badge"
import { SettingsSection } from "@/src/shared/components/settings/settings-section"
import { Button } from "@/src/shared/components/ui/button"
import { InfiniteListSentinel } from "@/src/shared/components/feedback/infinite-list-sentinel"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import {
  RepeatIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  XIcon,
} from "lucide-react"
import { cn } from "@/src/shared/lib/utils"

type SubscriptionsListProps = {
  isEnabled: boolean
  filters: SubscriptionFilters
  onChange: (next: SubscriptionFilters) => void
  display: FinanceMoneyDisplay
  today: Date
  /** Warning window in days, from the global setting. */
  windowDays: number
  groupBy: FinanceSubscriptionGroupBy
  onOpenFilters: () => void
}

/**
 * Managed subscriptions with the filters that are on. Owns its page of the
 * list: the header with the search and filter controls, the chips of the
 * active filters and the cards with their load, empty and error states.
 */
export function SubscriptionsList({
  isEnabled,
  filters,
  onChange,
  display,
  today,
  windowDays,
  groupBy,
  onOpenFilters,
}: SubscriptionsListProps) {
  const listQuery = useSubscriptions(isEnabled, subscriptionListQuery(filters))
  const accountsQuery = useAccounts(isEnabled)
  const cardsQuery = useCards(isEnabled)
  const categoriesQuery = useCategories(isEnabled)
  const items = infiniteListItems(listQuery.data)
  const accounts = accountsQuery.data ?? []
  const cards = cardsQuery.data ?? []
  const categories = categoriesQuery.data ?? []
  const chips = subscriptionFilterChips({
    filters,
    methodLabel: subscriptionMethodLabel({
      method: filters.method,
      accounts,
      cards,
    }),
    categoryLabels: Object.fromEntries(
      categories.map((category) => [category.id, category.name])
    ),
  })
  const activeFilterCount = activeSubscriptionFilterCount(filters)
  const groups = groupSubscriptions(items, groupBy)

  return (
    <SettingsSection
      title="Mis suscripciones"
      bare
      className="gap-3"
      headerTrailing={
        <div className="flex items-center gap-1">
          <span className="text-sm font-normal text-muted-foreground tabular-nums">
            {items.length}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Buscar suscripción"
            onClick={onOpenFilters}
          >
            <SearchIcon className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Filtros"
            className="relative"
            onClick={onOpenFilters}
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
      }
    >
      {chips.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <Button
              key={`${chip.key}-${chip.categoryId ?? ""}`}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onChange(clearSubscriptionFilter(filters, chip))}
            >
              {chip.label}
              <XIcon className="size-3.5 shrink-0" />
            </Button>
          ))}
        </div>
      ) : null}

      {listQuery.isError ? (
        <ErrorState
          message={financeErrorMessage(listQuery.error)}
          onRetry={() => void listQuery.refetch()}
          isRetrying={listQuery.isFetching}
        />
      ) : null}

      <AsyncRegion
        pending={listQuery.isPending && !listQuery.data}
        pendingFallback={<ListSkeleton rows={4} />}
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
              {groupBy !== "none" ? (
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
                    cards={cards}
                    accounts={accounts}
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
    </SettingsSection>
  )
}
