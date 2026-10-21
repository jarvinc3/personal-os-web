"use client"

import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import {
  FINANCE_LOAN_INSTALLMENT_STATUS_LABEL,
  type FinanceLoanInstallment,
} from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { Button } from "@/src/shared/components/ui/button"
import { SummaryItem } from "@/src/shared/components/ui/summary"
import { LinkPendingOverlay } from "@/src/shared/components/ui/navigation-pending"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { ChatLauncherButton, useRegisterChatContext } from "@/src/modules/ai"
import { ReceiptIcon, XIcon } from "lucide-react"
import Link from "next/link"

type InstallmentDetailSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  installment: FinanceLoanInstallment | null
  display: FinanceMoneyDisplay
}

export function InstallmentDetailSheet({
  open,
  onOpenChange,
  installment,
  display,
}: InstallmentDetailSheetProps) {
  useRegisterChatContext(
    open && installment
      ? {
          moduleSlug: "finance",
          screen: "loan-installment-detail",
          entityRef: { type: "loan_installment", id: installment.id },
          entityLabel: `Cuota ${installment.installmentNo}`,
        }
      : null
  )

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      headerAction={<ChatLauncherButton />}
      title={
        installment ? `Cuota ${installment.installmentNo}` : "Detalle de cuota"
      }
      description={
        installment
          ? `Vence ${formatCalendarDate(installment.dueDate, display.locale)} · ${FINANCE_LOAN_INSTALLMENT_STATUS_LABEL[installment.status]}`
          : undefined
      }
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
      {installment ? (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-card">
            {[
              { title: "Cuota", value: installment.amount },
              { title: "Capital", value: installment.principal },
              { title: "Interés", value: installment.interest },
              { title: "Seguro", value: installment.insurance },
              { title: "Cargos", value: installment.fees },
              { title: "Mora", value: installment.lateFee },
              { title: "Pagado", value: installment.paidAmount },
            ].map((row, index, rows) => (
              <SummaryItem
                key={row.title}
                title={row.title}
                value={formatFinanceMoney(row.value, display)}
                isLast={index === rows.length - 1}
              />
            ))}
          </div>

          {installment.transactionId ? (
            <Button asChild variant="outline" className="w-full">
              <Link
                href={APP_ROUTES.app.financeTransaction(
                  installment.transactionId
                )}
                className="relative"
              >
                <ReceiptIcon className="size-4 shrink-0" />
                Ver movimiento
                <LinkPendingOverlay spinnerClassName="size-4" />
              </Link>
            </Button>
          ) : null}
        </div>
      ) : null}
    </BottomSheet>
  )
}
