"use client"

import { GlossaryHelpButton } from "@/src/modules/help"
import { LoanProgressCard } from "@/src/modules/finance/loans"
import { ReceivableCard } from "@/src/modules/finance/receivables"
import {
  AccountProductRow,
  CardProductRow,
} from "@/src/modules/finance/shared/components/product-rows"
import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceAccount,
  FinanceBalanceDrift,
  FinanceBalanceSheetLine,
  FinanceCard,
  FinanceLoan,
  FinanceReceivable,
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
import type { ReactNode } from "react"

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

type LineCardProps = {
  line: FinanceBalanceSheetLine
  display: FinanceMoneyDisplay
  href: string | null
  onPress?: () => void
}

/** Compact card of the product behind the line, painted with the line amount. */
function lineCard({ line, display, href, onPress }: LineCardProps): ReactNode {
  const entity = line.entity
  if (!entity) {
    return null
  }
  const target = onPress ? { onPress } : { href: href ?? undefined }
  if (line.kind === "ACCOUNT" || line.kind === "CASH") {
    return (
      <AccountProductRow
        account={entity as FinanceAccount}
        display={display}
        variant="compact"
        {...target}
      />
    )
  }
  if (line.kind === "CREDIT_CARD") {
    return (
      <CardProductRow
        card={entity as FinanceCard}
        accounts={[]}
        display={display}
        variant="compact"
        balance={{
          amount: formatFinanceMoney(line.balance, {
            ...display,
            currency: line.currency,
          }),
          label: "Deuda",
        }}
        {...target}
      />
    )
  }
  if (line.kind === "LOAN") {
    const loan = entity as FinanceLoan
    return (
      <LoanProgressCard
        loan={loan}
        display={display}
        institution={{ name: loan.institution?.name ?? loan.lenderName }}
        variant="compact"
        {...target}
      />
    )
  }
  return (
    <ReceivableCard
      source={{ kind: "receivable", receivable: entity as FinanceReceivable }}
      display={display}
      variant="compact"
      {...target}
    />
  )
}

type WealthLineProps = {
  line: FinanceBalanceSheetLine
  display: FinanceMoneyDisplay
  drifts: readonly FinanceBalanceDrift[]
  isLast: boolean
  /** La galería simula el toque; en la app la línea navega por `href`. */
  onPress?: () => void
}

export function WealthLine({
  line,
  display,
  drifts,
  isLast,
  onPress,
}: WealthLineProps) {
  const drift = driftForLine(line, drifts)
  const hasDrift = line.hasDrift || drift !== null
  const status = lineStatus({ line, drift, display })
  const href = wealthLineHref(line)
  const card = lineCard({ line, display, href, onPress })

  if (!card) {
    const description = line.description
      ? `${line.description} · ${status}`
      : status
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

  return (
    <div className="flex flex-col gap-1.5">
      {card}
      <div className="flex min-w-0 items-center gap-2 px-1 text-[11px] text-muted-foreground">
        <LineMarks hasDrift={hasDrift} reconciliation={line.reconciliation} />
        <span className="min-w-0 truncate">{status}</span>
      </div>
    </div>
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
      <div className="flex flex-col gap-2">
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
