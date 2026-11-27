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
import { SheetBody } from "@/src/shared/components/sheets/sheet-body"
import { SheetHeader } from "@/src/shared/components/sheets/sheet-header"
import { SHEET_FOOTER_CLASS } from "@/src/shared/components/sheets/sheet-layout"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { SheetHelpAction } from "@/src/modules/help"
import { Badge } from "@/src/shared/components/ui/badge"
import { Button } from "@/src/shared/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/src/shared/components/ui/drawer"
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
  XIcon,
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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <SheetHeader
          title={item.concept}
          description={publicShareDetailDescription(ownerFirstName)}
          actions={
            <SheetHelpAction
              sheetKey={FINANCE_SHEET_KEYS.publicReceivableDetail}
            />
          }
        />
        <SheetBody>
          <div
            className="flex flex-col gap-3 rounded-2xl p-4 text-white"
            style={{
              background: accentSurfaceGradient(ACCENT_FALLBACK_COLOR),
            }}
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
        </SheetBody>
        <DrawerFooter className={SHEET_FOOTER_CLASS}>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4 shrink-0" aria-hidden="true" />
            Cancelar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
