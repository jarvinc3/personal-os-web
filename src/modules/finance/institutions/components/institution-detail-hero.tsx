"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import type { InstitutionStackCounts } from "@/src/modules/finance/shared/lib/institution-stack"
import type { FinanceInstitution } from "@/src/modules/finance/shared/types/entities"
import { ProductCountItem } from "@/src/modules/finance/products"
import { Button } from "@/src/shared/components/ui/button"
import { cn } from "@/src/shared/lib/utils"
import { Label } from "@/src/shared/components/ui/label"
import {
  CreditCardIcon,
  HandCoinsIcon,
  LandmarkIcon,
  PencilIcon,
} from "lucide-react"

type InstitutionDetailHeroProps = {
  institution: FinanceInstitution
  accent: string
  isCash: boolean
  counts: InstitutionStackCounts
  balanceText: string
  balanceLines: Array<{ currency: string; amount: string }>
  incompleteCardName: string | null
  onCompleteLimit: () => void
}

export function InstitutionDetailHero({
  institution,
  accent,
  isCash,
  counts,
  balanceText,
  balanceLines,
  incompleteCardName,
  onCompleteLimit,
}: InstitutionDetailHeroProps) {
  return (
    <div
      className="rounded-b-3xl p-4 text-white md:p-6"
      style={{ background: accent }}
    >
      <div className="flex items-center gap-3">
        <BrandLogo
          name={institution.name}
          logoUrl={institution.logoUrl}
          size={48}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="truncate text-2xl font-bold tracking-tight">
            {institution.name}
          </h1>
          <div className="flex items-center gap-3 text-base font-semibold text-white tabular-nums">
            <ProductCountItem
              icon={LandmarkIcon}
              count={counts.accounts}
              label="Cuentas"
            />
            {!isCash ? (
              <>
                <span className="h-4 w-px bg-white/40" />
                <ProductCountItem
                  icon={CreditCardIcon}
                  count={counts.cards}
                  label="Tarjetas"
                />
                <span className="h-4 w-px bg-white/40" />
                <ProductCountItem
                  icon={HandCoinsIcon}
                  count={counts.loans}
                  label="Préstamos"
                />
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-1 rounded-2xl bg-black/20 px-3 py-2">
        <Label className="text-sm text-foreground">Saldo</Label>
        {balanceLines.length === 0 ? (
          <p className="text-3xl font-bold tracking-tight tabular-nums">
            {balanceText}
          </p>
        ) : (
          balanceLines.map((line) => (
            <span
              key={line.currency}
              className="flex items-baseline justify-between gap-2"
            >
              {balanceLines.length > 1 ? (
                <span className="text-xs text-white/70">{line.currency}</span>
              ) : null}
              <span
                className={cn(
                  "flex-1 text-right font-bold tracking-tight tabular-nums",
                  balanceLines.length > 1 ? "text-xl" : "text-3xl"
                )}
              >
                {line.amount}
              </span>
            </span>
          ))
        )}
      </div>

      {incompleteCardName ? (
        <Button
          type="button"
          variant="secondary"
          className="mt-4 bg-white/15 text-white hover:bg-white/25"
          onClick={onCompleteLimit}
        >
          <PencilIcon className="size-4 shrink-0" />
          Completar límite de {incompleteCardName}
        </Button>
      ) : null}
    </div>
  )
}
