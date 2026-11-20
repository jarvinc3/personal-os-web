"use client"

import {
  DEFAULT_USAGE_DAYS,
  USAGE_RANGES,
  fillDailyUsage,
  fillHourlyUsage,
  isUsageDays,
  nextUtcDailyReset,
  usageRangeCaption,
  useEmailUsage,
  type UsageDays,
} from "@/src/modules/intelligence"
import { SettingsSecondaryPage } from "@/src/modules/settings/components/layout/settings-secondary-page"
import { UsageBreakdowns } from "@/src/modules/settings/components/usage/usage-breakdowns"
import { UsageCaps } from "@/src/modules/settings/components/usage/usage-caps"
import { UsageCharts } from "@/src/modules/settings/components/usage/usage-charts"
import { UsageEmpty } from "@/src/modules/settings/components/usage/usage-empty"
import { UsageSkeleton } from "@/src/modules/settings/components/usage/usage-skeleton"
import { UsageTotals } from "@/src/modules/settings/components/usage/usage-totals"
import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import { SettingsGate } from "@/src/modules/settings/settings-gate"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { SegmentedControl } from "@/src/shared/components/forms/segmented-control"
import { DEFAULT_LOCALE } from "@/src/shared/constants/locales"
import { CalendarDaysIcon, CalendarRangeIcon, SunIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

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

  // Los contadores del back se reinician a medianoche UTC; la vista se refresca
  // una vez al cruzar el día para que la pausa y el reinicio no queden viejos.
  // El día sale de la hora del servidor y, si el reloj del navegador va
  // adelantado, se reintenta un minuto después.
  useEffect(() => {
    if (!summary) {
      return
    }

    const serverNow = Date.parse(summary.range.to)
    const resetAt = nextUtcDailyReset(new Date(serverNow)).getTime()
    let timer: ReturnType<typeof setTimeout>
    let cancelled = false

    const refreshAtReset = async () => {
      const result = await refetch()

      if (cancelled) {
        return
      }

      const nextServerNow = result.data ? Date.parse(result.data.range.to) : 0

      if (nextServerNow >= resetAt) {
        return
      }

      timer = setTimeout(() => void refreshAtReset(), 60_000)
    }

    timer = setTimeout(
      () => void refreshAtReset(),
      Math.max(1_000, resetAt - Date.now() + 60_000)
    )

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [refetch, summary])

  const daily = useMemo(
    () =>
      summary
        ? fillDailyUsage({
            byDay: summary.byDay,
            from: summary.range.from,
            to: summary.range.to,
          })
        : [],
    [summary]
  )
  const hourly = useMemo(
    () => (summary ? fillHourlyUsage(summary.byHour) : []),
    [summary]
  )

  function handleRangeChange(value: UsageRangeValue) {
    const nextDays = Number(value)
    if (!isUsageDays(nextDays)) {
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

      {usageQuery.isPending ? <UsageSkeleton /> : null}

      {usageQuery.isError ? (
        <ErrorState
          message="No se pudo cargar el uso de clasificación."
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
          <UsageCaps caps={summary.caps} now={new Date()} locale={locale} />
          {summary.totals.calls === 0 ? (
            <UsageEmpty />
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
