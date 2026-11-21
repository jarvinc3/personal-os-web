"use client"

import {
  formatUsageCost,
  formatUsageCount,
  usageTotalTokens,
  type EmailUsageSummary,
} from "@/src/modules/intelligence"
import {
  SettingsRow,
  SettingsSection,
} from "@/src/shared/components/settings/settings-section"

type UsageTotalsProps = {
  totals: EmailUsageSummary["totals"]
  rangeLabel: string
  locale: string
}

export function UsageTotals({ totals, rangeLabel, locale }: UsageTotalsProps) {
  return (
    <SettingsSection title="Resumen" description={rangeLabel}>
      <SettingsRow
        label="Clasificaciones"
        description={`${formatUsageCount(totals.succeeded, locale)} con éxito y ${formatUsageCount(totals.failed, locale)} fallidas.`}
        value={formatUsageCount(totals.calls, locale)}
      />
      <SettingsRow
        label="Tokens"
        description="Entrada y salida enviados al modelo."
        value={formatUsageCount(usageTotalTokens(totals), locale)}
      />
      <SettingsRow
        label="Costo estimado"
        description="Lo que costó clasificar los correos del rango."
        value={formatUsageCost(totals.costUsd, locale)}
        isLast
      />
    </SettingsSection>
  )
}
