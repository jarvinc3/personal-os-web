"use client"

import { GlossaryHelpButton } from "@/src/modules/help"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import {
  ALERT_TONE_CLASS_NAME,
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"
import { SettingsSection } from "@/src/shared/components/settings/settings-section"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceBalanceDrift,
  FinanceBalanceSheetCurrencyGroup,
} from "@/src/modules/finance/shared/types/entities"
import {
  BanknoteIcon,
  CreditCardIcon,
  HandCoinsIcon,
  LandmarkIcon,
  TriangleAlertIcon,
  WalletIcon,
} from "lucide-react"
import { useId } from "react"

import { WealthLineGroup } from "./wealth-line"

type WealthCurrencySectionProps = {
  group: FinanceBalanceSheetCurrencyGroup
  display: FinanceMoneyDisplay
  drifts: readonly FinanceBalanceDrift[]
}

export function WealthCurrencySection({
  group,
  display,
  drifts,
}: WealthCurrencySectionProps) {
  const headingId = useId()
  const money = { ...display, currency: group.currency }
  const hasAssets =
    group.accounts.length > 0 ||
    group.cash.length > 0 ||
    group.receivables.length > 0
  const hasLiabilities = group.creditCards.length > 0 || group.loans.length > 0
  const hasDoubtful = group.doubtfulReceivables.length > 0

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-3 rounded-3xl border border-border bg-muted/40 p-3"
    >
      <header className="flex items-end justify-between gap-2 px-1">
        <div className="min-w-0">
          <h2 id={headingId} className="text-lg font-semibold">
            {group.currency}
          </h2>
          <p className="text-xs text-muted-foreground">
            Patrimonio en {group.currency}
          </p>
        </div>
        <p className="shrink-0 text-right text-sm font-bold tabular-nums">
          {formatFinanceMoney(group.totals.netWorth, {
            ...money,
            leadingSign: true,
          })}
        </p>
      </header>

      <SettingsSection
        title="Activos"
        bare
        headerTrailing={
          <span className="text-xs font-semibold tabular-nums">
            {formatFinanceMoney(group.totals.assets, money)}
          </span>
        }
      >
        {hasAssets ? (
          <>
            <WealthLineGroup
              title="Cuentas"
              icon={LandmarkIcon}
              lines={group.accounts}
              display={display}
              drifts={drifts}
            />
            <WealthLineGroup
              title="Efectivo"
              icon={BanknoteIcon}
              lines={group.cash}
              display={display}
              drifts={drifts}
              helpSlug="efectivo"
            />
            <WealthLineGroup
              title="Por cobrar"
              icon={HandCoinsIcon}
              lines={group.receivables}
              display={display}
              drifts={drifts}
              helpSlug="por-cobrar"
            />
          </>
        ) : (
          <p className="px-1 text-sm text-muted-foreground">
            Sin activos en {group.currency}.
          </p>
        )}
      </SettingsSection>

      <SettingsSection
        title="Deudas"
        bare
        headerTrailing={
          <span className="text-xs font-semibold tabular-nums">
            {formatFinanceMoney(group.totals.liabilities, money)}
          </span>
        }
      >
        {hasLiabilities ? (
          <>
            <WealthLineGroup
              title="Tarjetas"
              icon={CreditCardIcon}
              lines={group.creditCards}
              display={display}
              drifts={drifts}
              helpSlug="tarjeta"
            />
            <WealthLineGroup
              title="Préstamos"
              icon={WalletIcon}
              lines={group.loans}
              display={display}
              drifts={drifts}
              helpSlug="prestamo"
            />
          </>
        ) : (
          <p className="px-1 text-sm text-muted-foreground">
            Sin deudas en {group.currency}.
          </p>
        )}
      </SettingsSection>

      {hasDoubtful ? (
        <Alert
          variant="default"
          className={`gap-2 ${ALERT_TONE_CLASS_NAME.warning}`}
        >
          <TriangleAlertIcon aria-hidden />
          <AlertTitle className="flex items-center gap-2">
            Cobros dudosos
            <GlossaryHelpButton slug="dudosos" />
            <span className="ml-auto text-sm font-semibold tabular-nums">
              {formatFinanceMoney(group.totals.doubtfulReceivables, money)}
            </span>
          </AlertTitle>
          <AlertDescription>
            Vencidos hace más de 90 días; no suman al patrimonio.
          </AlertDescription>
          <div className="col-span-2">
            <WealthLineGroup
              title="Cobros"
              icon={HandCoinsIcon}
              lines={group.doubtfulReceivables}
              display={display}
              drifts={drifts}
            />
          </div>
        </Alert>
      ) : null}
    </section>
  )
}
