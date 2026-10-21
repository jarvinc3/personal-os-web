"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { PlanningProgressCard } from "@/src/modules/finance/shared/components/planning-progress-card"
import { formatRatePercentLabel } from "@/src/modules/finance/shared/lib/interest-rate"
import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import { loanProgressSummary } from "@/src/modules/finance/shared/lib/planning-lists"
import {
  FINANCE_INSTALLMENT_FREQ_LABEL,
  type FinanceLoan,
} from "@/src/modules/finance/shared/types/entities"
import { Badge } from "@/src/shared/components/ui/badge"
import { cn } from "@/src/shared/lib/utils"
import { CalendarDaysIcon } from "lucide-react"

type LoanProgressCardProps = {
  loan: FinanceLoan
  display: FinanceMoneyDisplay
  institution?: {
    name: string
    logoUrl?: string | null
    color?: string | null
  } | null
  href: string
}

export function LoanSurfaceMark({
  tinted = true,
  size = "card",
}: {
  tinted?: boolean
  size?: "card" | "header"
}) {
  const header = size === "header"
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      <span
        className={cn(
          "absolute",
          header ? "-top-16 -right-10 size-72" : "-top-8 -right-6 size-40",
          tinted ? "bg-white/20" : "bg-foreground/10"
        )}
        style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}
      />
      <span
        className={cn(
          "absolute",
          header
            ? "right-20 -bottom-20 size-52"
            : "right-16 -bottom-10 size-28",
          tinted ? "bg-black/20" : "bg-foreground/15"
        )}
        style={{ clipPath: "polygon(50% 100%, 0% 0%, 100% 0%)" }}
      />
    </span>
  )
}

export function LoanProgressCard({
  loan,
  display,
  institution,
  href,
}: LoanProgressCardProps) {
  const money = { ...display, currency: loan.currency }
  const { paidOff, progress } = loanProgressSummary(loan)
  const rateLabel = formatRatePercentLabel(loan.interestRate)
  const title = loan.name?.trim() || loan.lenderName
  const surfaceColor = institution?.color || null
  const tinted = Boolean(surfaceColor)
  const pillClass = tinted
    ? "border-transparent bg-white/15 text-white"
    : undefined

  return (
    <PlanningProgressCard
      title={title}
      surfaceColor={surfaceColor}
      decoration={<LoanSurfaceMark tinted={tinted} />}
      description={
        <span className="mt-1 flex flex-wrap items-center gap-1">
          <Badge variant="info" className={pillClass}>
            {FINANCE_INSTALLMENT_FREQ_LABEL[loan.installmentFreq]}
          </Badge>
          <Badge
            variant={rateLabel === "Sin tasa" ? "success" : "warning"}
            className={pillClass}
          >
            {rateLabel}
          </Badge>
        </span>
      }
      leading={
        <BrandLogo
          name={institution?.name ?? loan.lenderName}
          logoUrl={institution?.logoUrl}
          size={34}
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
            <span
              className={cn(
                "inline-flex items-center gap-1.5 font-medium",
                tinted ? "text-white/80" : "text-foreground/80"
              )}
            >
              <CalendarDaysIcon className="size-3.5 shrink-0" aria-hidden />
              Próximo pago ·{" "}
              {formatCalendarDate(loan.nextDueDate, display.locale)}
            </span>
          ) : null}
        </span>
      }
      href={href}
    />
  )
}
