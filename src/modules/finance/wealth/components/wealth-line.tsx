"use client"

import { GlossaryHelpButton } from "@/src/modules/help"
import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceBalanceDrift,
  FinanceBalanceSheetLine,
} from "@/src/modules/finance/shared/types/entities"
import { SummaryItem } from "@/src/shared/components/ui/summary"
import {
  BanknoteIcon,
  CreditCardIcon,
  HandCoinsIcon,
  LandmarkIcon,
  WalletIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { wealthLineHref } from "@/src/modules/finance/wealth/lib/wealth-links"

const LINE_ICON: Record<FinanceBalanceSheetLine["kind"], LucideIcon> = {
  ACCOUNT: LandmarkIcon,
  CASH: BanknoteIcon,
  RECEIVABLE: HandCoinsIcon,
  CREDIT_CARD: CreditCardIcon,
  LOAN: WalletIcon,
}

function driftForLine(
  line: FinanceBalanceSheetLine,
  drifts: readonly FinanceBalanceDrift[]
): FinanceBalanceDrift | null {
  if (line.kind === "CREDIT_CARD") {
    return (
      drifts.find(
        (drift) =>
          drift.cardId === line.id &&
          drift.currency.toUpperCase() === line.currency.toUpperCase()
      ) ?? null
    )
  }
  if (line.kind === "ACCOUNT" || line.kind === "CASH") {
    return drifts.find((drift) => drift.accountId === line.id) ?? null
  }
  return null
}

function lineStatus({
  line,
  drift,
  display,
}: {
  line: FinanceBalanceSheetLine
  drift: FinanceBalanceDrift | null
  display: FinanceMoneyDisplay
}): string {
  if (line.kind === "RECEIVABLE") {
    if (line.doubtful) {
      return "Vencido hace más de 90 días"
    }
    if (line.dueDate) {
      return `Vence ${formatCalendarDate(line.dueDate, display.locale)}`
    }
    return "Sin fecha de vencimiento"
  }
  if (line.kind === "LOAN") {
    return "Deuda pendiente"
  }
  const difference = drift?.difference ?? line.driftDifference
  const balanceLabel =
    line.balanceBase === null
      ? "Sin tasa de cambio"
      : line.hasDrift || difference !== null
        ? difference
          ? `Diferencia ${formatFinanceMoney(difference, {
              ...display,
              currency: line.currency,
            })}`
          : "Descuadre"
        : "Cuadra con sus movimientos"
  if (line.reconciliation === "NOT_APPLICABLE") {
    return balanceLabel
  }
  const reconciliationLabel =
    line.reconciliation === "PENDING" ? "Sin conciliar" : "Conciliado"
  return `${balanceLabel} · ${reconciliationLabel}`
}

function LineMarks({
  hasDrift,
  reconciliation,
}: {
  hasDrift: boolean
  reconciliation: FinanceBalanceSheetLine["reconciliation"]
}) {
  if (!hasDrift && reconciliation !== "PENDING") {
    return null
  }
  return (
    <span className="flex items-center gap-1">
      {hasDrift ? (
        <span
          className="size-2 rounded-full bg-destructive"
          title="Descuadre"
        />
      ) : null}
      {reconciliation === "PENDING" ? (
        <span
          className="size-2 rounded-full bg-warning"
          title="Sin conciliar"
        />
      ) : null}
    </span>
  )
}

type WealthLineProps = {
  line: FinanceBalanceSheetLine
  display: FinanceMoneyDisplay
  drifts: readonly FinanceBalanceDrift[]
  isLast: boolean
}

export function WealthLine({ line, display, drifts, isLast }: WealthLineProps) {
  const drift = driftForLine(line, drifts)
  const hasDrift = line.hasDrift || drift !== null
  const description = line.description
    ? `${line.description} · ${lineStatus({ line, drift, display })}`
    : lineStatus({ line, drift, display })
  const href = wealthLineHref(line)

  return (
    <SummaryItem
      title={line.name}
      description={description}
      icon={LINE_ICON[line.kind]}
      value={formatFinanceMoney(line.balance, {
        ...display,
        currency: line.currency,
      })}
      href={href ?? undefined}
      isLast={isLast}
      trailing={
        <LineMarks hasDrift={hasDrift} reconciliation={line.reconciliation} />
      }
    />
  )
}

type WealthLineGroupProps = {
  title: string
  icon: LucideIcon
  lines: readonly FinanceBalanceSheetLine[]
  display: FinanceMoneyDisplay
  drifts: readonly FinanceBalanceDrift[]
  helpSlug?: string
}

export function WealthLineGroup({
  title,
  icon: Icon,
  lines,
  display,
  drifts,
  helpSlug,
}: WealthLineGroupProps) {
  if (lines.length === 0) {
    return null
  }

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-2 px-2">
        <Icon className="size-4 text-muted-foreground" aria-hidden />
        <h3 className="flex-1 text-sm font-medium">{title}</h3>
        {helpSlug ? <GlossaryHelpButton slug={helpSlug} /> : null}
      </div>
      <div className="flex flex-col rounded-2xl border border-border bg-card p-2">
        {lines.map((line, index) => (
          <WealthLine
            key={`${line.kind}-${line.id}-${line.currency}`}
            line={line}
            display={display}
            drifts={drifts}
            isLast={index === lines.length - 1}
          />
        ))}
      </div>
    </section>
  )
}
