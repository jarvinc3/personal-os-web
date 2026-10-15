"use client"

import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import {
  useSubscriptionAlerts,
  useSubscriptionSummary,
} from "@/src/modules/finance/shared/hooks/use-subscriptions"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { AlertsSheet } from "@/src/modules/finance/subscriptions/components/alerts-sheet"
import { DetectedSheet } from "@/src/modules/finance/subscriptions/components/detected-sheet"
import { SubscriptionFiltersSheet } from "@/src/modules/finance/subscriptions/components/subscription-filters-sheet"
import { SubscriptionSheet } from "@/src/modules/finance/subscriptions/components/subscription-sheet"
import { SubscriptionsHero } from "@/src/modules/finance/subscriptions/components/subscriptions-hero"
import { SubscriptionsList } from "@/src/modules/finance/subscriptions/components/subscriptions-list"
import { UpcomingSheet } from "@/src/modules/finance/subscriptions/components/upcoming-sheet"
import {
  subscriptionFiltersFromSearchParams,
  withSubscriptionFilters,
  type SubscriptionFilters,
} from "@/src/modules/finance/subscriptions/lib/subscription-filters"
import { subscriptionShortcutBadges } from "@/src/modules/finance/subscriptions/lib/subscription-display"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { Fab } from "@/src/shared/components/layout/fab"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
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
  const summary = summaryQuery.data
  const windowDays =
    summary?.reminderWindowDays ?? config.subscriptions.reminderDaysBefore
  const badges = subscriptionShortcutBadges({
    summary,
    alertCount: alertsQuery.data?.length ?? 0,
  })

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

      <SubscriptionsList
        isEnabled={isEnabled}
        filters={filters}
        onChange={applyFilters}
        display={display}
        today={today}
        windowDays={windowDays}
        groupBy={config.subscriptions.groupBy}
        onOpenFilters={() => filtersSheet.setOpen(true)}
      />

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
        isEnabled={isEnabled}
        filters={filters}
        onChange={applyFilters}
        display={display}
      />
    </div>
  )
}
