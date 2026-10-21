"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import { useFormatLocale } from "@/src/modules/settings/hooks/use-format-locale"

type InstitutionPreviewCardProps = {
  name: string
  color: string
  logoUrl: string | null
  caption: string
}

export function InstitutionPreviewCard({
  name,
  color,
  logoUrl,
  caption,
}: InstitutionPreviewCardProps) {
  const locale = useFormatLocale()
  return (
    <div
      className="flex flex-col justify-between gap-6 rounded-3xl p-5 text-white"
      style={{ backgroundColor: color || "#D6C5B3" }}
    >
      <div className="flex items-center gap-3">
        <BrandLogo name={name || "Institución"} logoUrl={logoUrl} size={44} />
        <span className="min-w-0 flex-1 truncate text-lg font-semibold">
          {name || "Nueva institución"}
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-white/80">{caption}</span>
        <span className="text-xl font-semibold tabular-nums">
          {formatFinanceMoney("0", {
            currency: "DOP",
            showCents: true,
            compactNumbers: false,
            locale,
          })}
        </span>
      </div>
    </div>
  )
}
