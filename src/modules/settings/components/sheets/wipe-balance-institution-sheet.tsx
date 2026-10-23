"use client"

import {
  buildInstitutionCardFromCatalog,
  buildPlainInstitutionCard,
  InstitutionWalletCard,
  useBalanceSheet,
} from "@/src/modules/finance"
import { useFinanceEnabled } from "@/src/modules/finance"
import { useInstitutions } from "@/src/modules/finance"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance"
import type { FinanceBalanceSheetSlice } from "@/src/modules/finance"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { Skeleton } from "@/src/shared/components/ui/skeleton"

const ALL_INSTITUTIONS_COLOR = "#0f172a"

type WipeBalanceInstitutionSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string
  allValue: string
  onSelect: (value: string) => void
}

function balanceLabel(
  slice: FinanceBalanceSheetSlice | undefined,
  display: FinanceMoneyDisplay
): string {
  if (!slice || slice.status !== "COMPLETE" || slice.netWorth === null) {
    return "Balance incompleto"
  }
  return formatFinanceMoney(slice.netWorth, display)
}

function positionBalanceLines(
  slice: FinanceBalanceSheetSlice | undefined,
  display: FinanceMoneyDisplay
): Array<{ currency: string; amount: string }> {
  return (slice?.byCurrency ?? []).map((currency) => ({
    currency: currency.currency,
    amount: formatFinanceMoney(currency.netWorth, {
      ...display,
      currency: currency.currency,
    }),
  }))
}

export function WipeBalanceInstitutionSheet({
  open,
  onOpenChange,
  value,
  allValue,
  onSelect,
}: WipeBalanceInstitutionSheetProps) {
  const { config, formatLocale } = useFinanceEnabled()
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
    locale: formatLocale,
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
        <div className="flex flex-col gap-2">
          <InstitutionWalletCard
            card={buildPlainInstitutionCard({
              name: "Todas las instituciones",
              color: ALL_INSTITUTIONS_COLOR,
              balanceAmount: balanceLabel(
                balanceSheetQuery.data?.global,
                display
              ),
            })}
            variant="compact"
            detail="balance"
            selected={value === allValue}
            onPress={() => choose(allValue)}
          />
          {institutions.map((institution) => {
            const position = positions.get(institution.id)
            return (
              <InstitutionWalletCard
                key={institution.id}
                card={buildInstitutionCardFromCatalog({
                  institution,
                  balanceLabel: "Balance",
                  balanceAmount: balanceLabel(position, display),
                  balanceLines: positionBalanceLines(position, display),
                })}
                variant="compact"
                detail="balance"
                selected={value === institution.id}
                onPress={() => choose(institution.id)}
              />
            )
          })}
        </div>
      )}
    </BottomSheet>
  )
}
