"use client"

import { BrandLogo } from "@/src/modules/finance"
import { useBalanceSheet } from "@/src/modules/finance"
import { useFinanceEnabled } from "@/src/modules/finance"
import { useInstitutions } from "@/src/modules/finance"
import { formatFinanceMoney } from "@/src/modules/finance"
import type { FinanceBalanceSheetSlice } from "@/src/modules/finance"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/src/shared/components/ui/radio-group"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { LayersIcon } from "lucide-react"
import type { ReactNode } from "react"

const ALL_INSTITUTIONS_COLOR = "#0f172a"
const FALLBACK_INSTITUTION_COLOR = "#1B4332"

type WipeBalanceInstitutionSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string
  allValue: string
  onSelect: (value: string) => void
}

function balanceLabel(
  slice: FinanceBalanceSheetSlice | undefined,
  currency: string,
  showCents: boolean,
  compactNumbers: boolean
): string {
  if (!slice || slice.status !== "COMPLETE" || slice.netWorth === null) {
    return "Balance incompleto"
  }
  return formatFinanceMoney(slice.netWorth, {
    currency,
    showCents,
    compactNumbers,
  })
}

export function WipeBalanceInstitutionSheet({
  open,
  onOpenChange,
  value,
  allValue,
  onSelect,
}: WipeBalanceInstitutionSheetProps) {
  const { config } = useFinanceEnabled()
  const institutionsQuery = useInstitutions(open)
  const balanceSheetQuery = useBalanceSheet(open)
  const institutions = (institutionsQuery.data ?? []).filter(
    (institution) => institution.isActive
  )
  const positions = new Map(
    (balanceSheetQuery.data?.institutions ?? []).map((position) => [
      position.institutionId,
      position,
    ])
  )
  const loading =
    (institutionsQuery.isPending && institutions.length === 0) ||
    (balanceSheetQuery.isPending && !balanceSheetQuery.data)
  const display = {
    currency: balanceSheetQuery.data?.baseCurrency ?? config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }

  function choose(next: string) {
    onSelect(next)
    onOpenChange(false)
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Institución"
      description="Elige de quién se ponen los saldos en cero."
    >
      {loading ? (
        <div className="flex flex-col gap-2" aria-hidden>
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <RadioGroup
          value={value}
          onValueChange={choose}
          className="flex flex-col gap-2"
        >
          <ScopeCard
            optionValue={allValue}
            name="Todas las instituciones"
            color={ALL_INSTITUTIONS_COLOR}
            balance={balanceLabel(
              balanceSheetQuery.data?.global,
              display.currency,
              display.showCents,
              display.compactNumbers
            )}
            mark={<LayersIcon className="size-5" />}
          />
          {institutions.map((institution) => (
            <ScopeCard
              key={institution.id}
              optionValue={institution.id}
              name={institution.name}
              logoUrl={institution.logoUrl}
              color={institution.color ?? FALLBACK_INSTITUTION_COLOR}
              balance={balanceLabel(
                positions.get(institution.id),
                display.currency,
                display.showCents,
                display.compactNumbers
              )}
            />
          ))}
        </RadioGroup>
      )}
    </BottomSheet>
  )
}

function ScopeCard({
  optionValue,
  name,
  logoUrl,
  color,
  balance,
  mark,
}: {
  optionValue: string
  name: string
  logoUrl?: string | null
  color: string
  balance: string
  mark?: ReactNode
}) {
  return (
    <label
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl p-4 text-left text-white",
        PRESSABLE_CLASS
      )}
      style={{ backgroundColor: color }}
    >
      {mark ? (
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-900">
          {mark}
        </span>
      ) : (
        <BrandLogo name={name} logoUrl={logoUrl} size={40} />
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-semibold">{name}</span>
        <span className="block truncate text-sm font-medium text-white/80">
          {balance}
        </span>
      </span>
      <RadioGroupItem
        value={optionValue}
        aria-label={name}
        className="border-white/80 bg-white/10 data-[state=checked]:border-white data-[state=checked]:bg-white data-checked:border-white data-checked:bg-white [&_[data-slot=radio-group-indicator]>span]:bg-slate-900"
      />
    </label>
  )
}
