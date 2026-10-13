"use client"

import { buildAmortizationPlan } from "@/src/modules/finance/loans/lib/amortization-plan"
import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import {
  formatFinanceMoney,
  parseFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import {
  FINANCE_LOAN_INSTALLMENT_STATUS_LABEL,
  type FinanceLoanInstallment,
} from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { Badge } from "@/src/shared/components/ui/badge"
import { Button } from "@/src/shared/components/ui/button"
import type { VariantProps } from "class-variance-authority"
import { badgeVariants } from "@/src/shared/components/ui/badge"
import { XIcon } from "lucide-react"

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"]

const INSTALLMENT_STATUS_VARIANT: Record<
  FinanceLoanInstallment["status"],
  BadgeVariant
> = {
  PENDING: "warning",
  PARTIAL: "warning",
  PAID: "success",
  OVERDUE: "destructive",
}

type LoanAmortizationSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  installments: readonly FinanceLoanInstallment[]
  currentBalance: string
  display: FinanceMoneyDisplay
}

export function LoanAmortizationSheet({
  open,
  onOpenChange,
  installments,
  currentBalance,
  display,
}: LoanAmortizationSheetProps) {
  const plan = buildAmortizationPlan(
    installments,
    parseFinanceMoney(currentBalance) ?? 0
  )

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Plan de amortización"
      description="Capital, interés y saldo restante de cada cuota"
      actions={{
        close: (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4 shrink-0" />
            Cerrar
          </Button>
        ),
      }}
    >
      {plan.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Todavía no hay cuotas para proyectar.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-96 text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground uppercase">
                <th className="py-2 pr-3 font-medium">Cuota</th>
                <th className="py-2 pr-3 font-medium">Vence</th>
                <th className="py-2 pr-3 text-right font-medium">Capital</th>
                <th className="py-2 pr-3 text-right font-medium">Interés</th>
                <th className="py-2 text-right font-medium">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {plan.map((row) => (
                <tr key={row.installmentNo} className="border-t border-border">
                  <td className="py-2 pr-3">
                    <span className="flex items-center gap-2">
                      {row.installmentNo}
                      <Badge
                        variant={INSTALLMENT_STATUS_VARIANT[row.status]}
                        className="shrink-0"
                      >
                        {FINANCE_LOAN_INSTALLMENT_STATUS_LABEL[row.status]}
                      </Badge>
                    </span>
                  </td>
                  <td className="py-2 pr-3 whitespace-nowrap text-muted-foreground">
                    {formatCalendarDate(row.dueDate)}
                  </td>
                  <td className="py-2 pr-3 text-right tabular-nums">
                    {formatFinanceMoney(row.principal, display)}
                  </td>
                  <td className="py-2 pr-3 text-right tabular-nums">
                    {formatFinanceMoney(row.interest, display)}
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {formatFinanceMoney(row.remainingBalance, display)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </BottomSheet>
  )
}
