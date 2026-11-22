"use client"

import {
  DEFAULT_USAGE_DAYS,
  USAGE_RANGES,
  usageRangeCaption,
  useEmailUsage,
  type UsageDays,
} from "@/src/modules/intelligence"
import { SettingsSecondaryPage } from "@/src/modules/settings/components/layout/settings-secondary-page"
import { UsageBreakdowns } from "@/src/modules/settings/components/usage/usage-breakdowns"
import { UsageCaps } from "@/src/modules/settings/components/usage/usage-caps"
import { UsageCharts } from "@/src/modules/settings/components/usage/usage-charts"
import { UsageStateView } from "@/src/modules/settings/components/usage/usage-state-view"
import { UsageTotals } from "@/src/modules/settings/components/usage/usage-totals"
import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import { useUsageResetRefresh } from "@/src/modules/settings/hooks/use-usage-reset-refresh"
import {
  resolveUsageChartSeries,
  resolveUsageRangeDays,
} from "@/src/modules/settings/lib/usage-range"
import { SettingsGate } from "@/src/modules/settings/settings-gate"
import { SegmentedControl } from "@/src/shared/components/forms/segmented-control"
import { DEFAULT_LOCALE } from "@/src/shared/constants/locales"
import { CalendarDaysIcon, CalendarRangeIcon, SunIcon } from "lucide-react"
import { useMemo, useState } from "react"

type UsageRangeValue = `${UsageDays}`

const USAGE_RANGE_ICONS = {
  1: SunIcon,
  7: CalendarDaysIcon,
  30: CalendarRangeIcon,
} as const

const USAGE_RANGE_OPTIONS = USAGE_RANGES.map((range) => ({
  value: String(range.days) as UsageRangeValue,
  label: range.label,
  icon: USAGE_RANGE_ICONS[range.days],
}))

export function UsageSettingsScreen() {
  return (
    <SettingsGate>
      <UsageSettingsScreenBody />
    </SettingsGate>
  )
}

function UsageSettingsScreenBody() {
  const [days, setDays] = useState<UsageDays>(DEFAULT_USAGE_DAYS)
  const { profileQuery } = useProfile()
  const locale = profileQuery.data?.locale ?? DEFAULT_LOCALE
  const usageQuery = useEmailUsage(days)
  const { refetch } = usageQuery
  const summary = usageQuery.data

  useUsageResetRefresh({ summary, refetch })

  const { daily, hourly } = useMemo(
    () => resolveUsageChartSeries(summary),
    [summary]
  )

  function handleRangeChange(value: UsageRangeValue) {
    const nextDays = resolveUsageRangeDays(value)
    if (nextDays === null) {
      return
    }
    setDays(nextDays)
  }

  return (
    <SettingsSecondaryPage title="Uso">
      <SegmentedControl
        ariaLabel="Rango de uso"
        value={String(days) as UsageRangeValue}
        onChange={handleRangeChange}
        options={USAGE_RANGE_OPTIONS}
        fullWidth
      />

      {usageQuery.isPending ? <UsageStateView state="loading" /> : null}

      {usageQuery.isError ? (
        <UsageStateView
          state="error"
          onRetry={() => void usageQuery.refetch()}
          isRetrying={usageQuery.isFetching}
        />
      ) : null}

      {summary ? (
        <>
          <UsageTotals
            totals={summary.totals}
            rangeLabel={usageRangeCaption(days)}
            locale={locale}
          />
          <UsageCaps
            caps={summary.caps}
            now={new Date(summary.range.to)}
            locale={locale}
          />
          {summary.totals.calls === 0 ? (
            <UsageStateView state="empty" />
          ) : (
            <>
              <UsageCharts daily={daily} hourly={hourly} locale={locale} />
              <UsageBreakdowns
                byBank={summary.byBank}
                byType={summary.byType}
                locale={locale}
              />
            </>
          )}
        </>
      ) : null}
    </SettingsSecondaryPage>
  )
}
