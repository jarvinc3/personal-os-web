"use client"

import {
  publicShareDetailDescription,
  publicShareItemProgress,
  publicSharePaymentRows,
  publicShareSummaryRows,
  type PublicReceivableShareItem,
} from "@/src/modules/finance/receivables/lib/public-receivable-share"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { FINANCE_RECEIVABLE_STATUS_LABEL } from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { Badge } from "@/src/shared/components/ui/badge"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import {
  SummaryItem,
  SummarySection,
} from "@/src/shared/components/data-display/summary"
import {
  ACCENT_FALLBACK_COLOR,
  accentSurfaceGradient,
} from "@/src/shared/lib/accent-gradient"
import {
  CheckIcon,
  HandshakeIcon,
  NotebookPenIcon,
  ReceiptIcon,
  WalletIcon,
} from "lucide-react"

type PublicShareDetailSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: PublicReceivableShareItem | null
  ownerFirstName: string
  display: FinanceMoneyDisplay
}

export function PublicShareDetailSheet({
  open,
  onOpenChange,
  item,
  ownerFirstName,
  display,
}: PublicShareDetailSheetProps) {
  if (!item) {
    return null
  }

  const money = { ...display, currency: item.currency }
  const pendingLabel = formatFinanceMoney(item.pending, money)
  const progress = publicShareItemProgress(item)
  const rows = publicShareSummaryRows(item, display)
  const payments = publicSharePaymentRows(item, display)

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={item.concept}
      description={publicShareDetailDescription(ownerFirstName)}
    >
      <div
        className="flex flex-col gap-3 rounded-2xl p-4 text-white"
        style={{ background: accentSurfaceGradient(ACCENT_FALLBACK_COLOR) }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="block text-[11px] tracking-wide text-white/60 uppercase">
              Pendiente
            </span>
            <span className="block text-3xl font-bold tracking-tight tabular-nums">
              {pendingLabel}
            </span>
          </div>
          <Badge
            variant="info"
            className="border-transparent bg-white/15 text-white"
          >
            {FINANCE_RECEIVABLE_STATUS_LABEL[item.status] ?? item.status}
          </Badge>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex flex-wrap justify-between gap-x-3 text-xs text-white/70">
          <span>{Math.round(progress)}% pagado</span>
          <span className="tabular-nums">
            Total {formatFinanceMoney(item.amount, money)}
          </span>
        </div>
      </div>

      <SummarySection title="Resumen" icon={WalletIcon}>
        {rows.map((row, index) => (
          <SummaryItem
            key={row.label}
            title={row.label}
            value={
              row.tone === "success" ? (
                <span className="text-success">{row.value}</span>
              ) : (
                row.value
              )
            }
            isLast={index === rows.length - 1}
          />
        ))}
      </SummarySection>

      {item.note ? (
        <SummarySection title="Nota" icon={NotebookPenIcon}>
          <p className="px-2 text-sm">{item.note}</p>
        </SummarySection>
      ) : null}

      <SummarySection title="Historial de pagos" icon={ReceiptIcon}>
        {payments.length === 0 ? (
          <Empty className="py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HandshakeIcon />
              </EmptyMedia>
              <EmptyTitle>Sin pagos registrados</EmptyTitle>
              <EmptyDescription>
                Aquí aparecerá cada pago que registre quien te debe.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          payments.map((payment, index) => (
            <SummaryItem
              key={payment.key}
              title={payment.amountLabel}
              description={payment.dateLabel}
              leading={<CheckIcon className="size-5 text-success" />}
              leadingClassName="bg-success/15"
              trailing={<Badge variant="secondary">Pago</Badge>}
              isLast={index === payments.length - 1}
            />
          ))
        )}
      </SummarySection>
    </BottomSheet>
  )
}
