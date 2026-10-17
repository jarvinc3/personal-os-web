"use client"

import { currencyFlagRegion } from "@/src/modules/finance/shared/lib/finance-currency"
import { narrowCurrencySymbol } from "@/src/modules/finance/shared/lib/money"
import { cn } from "@/src/shared/lib/utils"
import Image from "next/image"

/**
 * Raster flag. Emoji regional indicators render as the two letters ("DO")
 * when the platform font has no flag glyphs.
 */
export function CurrencyFlag({
  code,
  className,
}: {
  code: string
  className?: string
}) {
  const region = currencyFlagRegion(code)
  if (!region) {
    return null
  }
  return (
    <Image
      src={`https://flagcdn.com/24x18/${region.toLowerCase()}.png`}
      alt=""
      width={24}
      height={18}
      unoptimized
      className={cn(
        "h-[18px] w-6 shrink-0 rounded-[3px] object-cover",
        className
      )}
    />
  )
}

export function CurrencyTriggerLabel({ code }: { code: string }) {
  const normalized = code.trim().toUpperCase()
  const symbol = narrowCurrencySymbol(normalized)
  return (
    <span className="inline-flex items-center gap-1.5">
      <CurrencyFlag code={normalized} />
      <span>{symbol ? `${normalized} ${symbol}` : normalized}</span>
    </span>
  )
}
