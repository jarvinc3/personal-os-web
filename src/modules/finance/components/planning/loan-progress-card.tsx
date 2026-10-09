"use client"

import { BrandLogo } from "@/src/modules/finance/components/brand-logo"
import { PlanningProgressCard } from "@/src/modules/finance/components/planning/planning-progress-card"
import { formatRatePercentLabel } from "@/src/modules/finance/lib/interest-rate"
import { formatCalendarDate } from "@/src/modules/finance/lib/ledger-form"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/lib/money"
import {
  loanProgressSummary,
} from "@/src/modules/finance/lib/planning-lists"
import {
  FINANCE_INSTALLMENT_FREQ_LABEL,
  type FinanceLoan,
} from "@/src/modules/finance/types/entities"
import { Badge } from "@/src/shared/components/ui/badge"
import { CalendarDaysIcon } from "lucide-react"

type LoanProgressCardProps = {
  loan: FinanceLoan
  display: FinanceMoneyDisplay
  institution?: {
    name: string
    logoUrl?: string | null
  } | null
  onPress: () => void
}

export function LoanProgressCard({
  loan,
  display,
  institution,
  onPress,
}: LoanProgressCardProps) {
  const money = { ...display, currency: loan.currency }
  const { paidOff, progress } = loanProgressSummary(loan)
  const rateLabel = formatRatePercentLabel(loan.interestRate)

  return (
    <PlanningProgressCard
      title={loan.lenderName}
      description={
        <span className="mt-1 flex flex-wrap items-center gap-1">
          <Badge variant="info">
            {FINANCE_INSTALLMENT_FREQ_LABEL[loan.installmentFreq]}
          </Badge>
          <Badge variant={rateLabel === "Sin tasa" ? "success" : "warning"}>
            {rateLabel}
          </Badge>
        </span>
      }
      leading={
        <BrandLogo
          name={institution?.name ?? loan.lenderName}
          logoUrl={institution?.logoUrl}
          size={28}
        />
      }
      tone={paidOff ? "success" : "warning"}
      badge={{
        label: paidOff ? "Saldado" : "Activo",
        variant: paidOff ? "success" : "warning",
      }}
      progress={progress}
      currentHint="Saldo"
      currentLabel={formatFinanceMoney(loan.currentBalance, money)}
      targetHint="Original"
      targetLabel={formatFinanceMoney(loan.originalAmount, money)}
      caption={
        <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <span>
            {loan.paidInstallments}/{loan.totalInstallments} cuotas
          </span>
          {loan.nextDueDate ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground/80">
              <CalendarDaysIcon className="size-3.5 shrink-0" aria-hidden />
              Próximo pago · {formatCalendarDate(loan.nextDueDate)}
            </span>
          ) : null}
        </span>
      }
      onPress={onPress}
    />
  )
}
