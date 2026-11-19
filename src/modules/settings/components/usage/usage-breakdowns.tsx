"use client"

import {
  formatUsageCost,
  formatUsageCount,
  usageTotalTokens,
  usageTypeLabel,
  type EmailUsageBank,
  type EmailUsageBucket,
  type EmailUsageType,
} from "@/src/modules/intelligence"
import {
  SettingsRow,
  SettingsSection,
} from "@/src/shared/components/settings/settings-section"

type UsageBreakdownsProps = {
  byBank: EmailUsageBank[]
  byType: EmailUsageType[]
  locale: string
}

export function UsageBreakdowns({
  byBank,
  byType,
  locale,
}: UsageBreakdownsProps) {
  if (!byBank.length && !byType.length) {
    return null
  }

  return (
    <div className="flex flex-col gap-6">
      {byBank.length ? (
        <SettingsSection
          title="Por banco"
          description="Dominio del remitente; suma el total de clasificaciones."
        >
          {byBank.map((bucket, index) => (
            <UsageBreakdownRow
              key={bucket.bank}
              label={bucket.bank}
              bucket={bucket}
              locale={locale}
              isLast={index === byBank.length - 1}
            />
          ))}
        </SettingsSection>
      ) : null}

      {byType.length ? (
        <SettingsSection
          title="Por tipo de clasificación"
          description="Tipo semántico que asignó el clasificador."
        >
          {byType.map((bucket, index) => (
            <UsageBreakdownRow
              key={bucket.type}
              label={usageTypeLabel(bucket.type)}
              bucket={bucket}
              locale={locale}
              isLast={index === byType.length - 1}
            />
          ))}
        </SettingsSection>
      ) : null}
    </div>
  )
}

type UsageBreakdownRowProps = {
  label: string
  bucket: EmailUsageBucket
  locale: string
  isLast: boolean
}

function UsageBreakdownRow({
  label,
  bucket,
  locale,
  isLast,
}: UsageBreakdownRowProps) {
  const calls = formatUsageCount(bucket.calls, locale)

  return (
    <SettingsRow
      label={label}
      description={`${formatUsageCount(usageTotalTokens(bucket), locale)} tokens · ${formatUsageCost(bucket.costUsd, locale)}`}
      value={bucket.calls === 1 ? "1 llamada" : `${calls} llamadas`}
      isLast={isLast}
    />
  )
}
