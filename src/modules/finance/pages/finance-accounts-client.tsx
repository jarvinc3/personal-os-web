"use client"

import { AccountSheet } from "@/src/modules/finance/components/catalog/account-sheet"
import { CardBalanceSheet } from "@/src/modules/finance/components/catalog/card-balance-sheet"
import { CardSheet } from "@/src/modules/finance/components/catalog/card-sheet"
import { FinanceCategoriesSection } from "@/src/modules/finance/components/catalog/finance-categories-section"
import { InstitutionSheet } from "@/src/modules/finance/components/catalog/institution-sheet"
import { FinanceAuthenticatedPage } from "@/src/modules/finance/components/layout/finance-authenticated-page"
import {
  FINANCE_ACCOUNT_TYPE_LABEL,
  FINANCE_CARD_TYPE_LABEL,
} from "@/src/modules/finance/constants/catalog"
import { useAccounts } from "@/src/modules/finance/hooks/use-accounts"
import { useCards } from "@/src/modules/finance/hooks/use-cards"
import { useFinanceEnabled } from "@/src/modules/finance/hooks/use-finance-enabled"
import { useInstitutions } from "@/src/modules/finance/hooks/use-institutions"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import { formatFinanceMoney } from "@/src/modules/finance/lib/money"
import type {
  FinanceAccount,
  FinanceCard,
  FinanceInstitution,
} from "@/src/modules/finance/types/entities"
import {
  SettingsRow,
} from "@/src/shared/components/layout/settings-section"
import { SummarySection } from "@/src/shared/components/layout/summary"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { Building2Icon, CreditCardIcon, LandmarkIcon, PlusIcon } from "lucide-react"
import { useMemo, useState } from "react"

type SheetState =
  | { kind: "none" }
  | { kind: "institution"; item: FinanceInstitution | null }
  | { kind: "account"; item: FinanceAccount | null }
  | { kind: "card"; item: FinanceCard | null }
  | { kind: "card-balance"; item: FinanceCard }

export function FinanceAccountsClient() {
  return (
    <FinanceAuthenticatedPage>
      <FinanceAccountsCatalog />
    </FinanceAuthenticatedPage>
  )
}

function FinanceAccountsCatalog() {
  const { isEnabled, config } = useFinanceEnabled()
  const display = config.display
  const defaultCurrency = config.baseCurrency
  const institutionsQuery = useInstitutions(isEnabled)
  const accountsQuery = useAccounts(isEnabled)
  const cardsQuery = useCards(isEnabled)
  const [sheet, setSheet] = useState<SheetState>({ kind: "none" })

  const institutions = institutionsQuery.data ?? []
  const accounts = accountsQuery.data ?? []
  const cards = cardsQuery.data ?? []

  const accountsEmpty =
    accountsQuery.isSuccess && accounts.length === 0 && !accountsQuery.isPending

  const errorMessage = useMemo(() => {
    const error =
      institutionsQuery.error ?? accountsQuery.error ?? cardsQuery.error
    return error ? financeErrorMessage(error) : null
  }, [institutionsQuery.error, accountsQuery.error, cardsQuery.error])

  function closeSheet() {
    setSheet({ kind: "none" })
  }

  return (
    <>
      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}

      {/* Institutions */}
      <SummarySection
        title="Instituciones"
        icon={Building2Icon}
        right={
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSheet({ kind: "institution", item: null })}
          >
            <PlusIcon />
            Crear institución
          </Button>
        }
      >
        {institutionsQuery.isPending ? (
          <div className="flex justify-center p-6">
            <Spinner />
          </div>
        ) : institutions.length === 0 ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Building2Icon />
              </EmptyMedia>
              <EmptyTitle>Aún no hay instituciones</EmptyTitle>
              <EmptyDescription>
                Agrégala antes de crear una cuenta o una tarjeta.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => setSheet({ kind: "institution", item: null })}>
                Crear institución
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          institutions.map((institution, index) => (
            <SettingsRow
              key={institution.id}
              label={institution.name}
              value={institution.country ?? undefined}
              accentColor={institution.color ?? undefined}
              icon={Building2Icon}
              onPress={() =>
                setSheet({ kind: "institution", item: institution })
              }
              isLast={index === institutions.length - 1}
            />
          ))
        )}
      </SummarySection>

      {/* Accounts */}
      <SummarySection
        title="Cuentas"
        icon={LandmarkIcon}
        right={
          <Button
            size="sm"
            variant="ghost"
            disabled={institutions.length === 0}
            onClick={() => setSheet({ kind: "account", item: null })}
          >
            <PlusIcon />
            Crear cuenta
          </Button>
        }
      >
        {accountsQuery.isPending ? (
          <div className="flex justify-center p-6">
            <Spinner />
          </div>
        ) : accountsEmpty ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <LandmarkIcon />
              </EmptyMedia>
              <EmptyTitle>Aún no hay cuentas</EmptyTitle>
              <EmptyDescription>
                {institutions.length === 0
                  ? "Crea una institución bancaria primero. Luego puedes agregar la cuenta."
                  : "Crea la primera para registrar movimientos después."}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              {institutions.length === 0 ? (
                <Button onClick={() => setSheet({ kind: "institution", item: null })}>
                  Crear institución
                </Button>
              ) : (
                <Button onClick={() => setSheet({ kind: "account", item: null })}>
                  Crear cuenta
                </Button>
              )}
            </EmptyContent>
          </Empty>
        ) : (
          accounts.map((account, index) => (
            <SettingsRow
              key={account.id}
              label={account.name}
              value={`${FINANCE_ACCOUNT_TYPE_LABEL[account.type]} · ${formatFinanceMoney(account.balance, { currency: account.currency, showCents: display.showCents, compactNumbers: display.compactNumbers })}`}
              accentColor={account.color ?? undefined}
              icon={LandmarkIcon}
              onPress={() => setSheet({ kind: "account", item: account })}
              isLast={index === accounts.length - 1}
            />
          ))
        )}
      </SummarySection>

      {/* Cards */}
      <SummarySection
        title="Tarjetas"
        icon={CreditCardIcon}
        right={
          <Button
            size="sm"
            variant="ghost"
            disabled={institutions.length === 0}
            onClick={() => setSheet({ kind: "card", item: null })}
          >
            <PlusIcon />
            Crear tarjeta
          </Button>
        }
      >
        {cardsQuery.isPending ? (
          <div className="flex justify-center p-6">
            <Spinner />
          </div>
        ) : cards.length === 0 ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CreditCardIcon />
              </EmptyMedia>
              <EmptyTitle>Aún no hay tarjetas</EmptyTitle>
              <EmptyDescription>
                Crea una institución primero. Luego puedes agregar crédito o
                débito.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          cards.map((card, index) => {
            const primary = card.balances[0]
            const amount = primary
              ? formatFinanceMoney(primary.balance, {
                currency: primary.currency,
                showCents: display.showCents,
                compactNumbers: display.compactNumbers,
              })
              : "Sin saldo"
            return (
              <SettingsRow
                key={card.id}
                label={card.name}
                value={`${FINANCE_CARD_TYPE_LABEL[card.type]} · ${amount}`}
                accentColor={card.color ?? undefined}
                icon={CreditCardIcon}
                onPress={() => setSheet({ kind: "card", item: card })}
                isLast={index === cards.length - 1}
              />
            )
          })
        )}
      </SummarySection>

      <FinanceCategoriesSection enabled={isEnabled} />

      <InstitutionSheet
        open={sheet.kind === "institution"}
        onOpenChange={(open) => {
          if (!open) closeSheet()
        }}
        institution={sheet.kind === "institution" ? sheet.item : null}
      />
      <AccountSheet
        open={sheet.kind === "account"}
        onOpenChange={(open) => {
          if (!open) closeSheet()
        }}
        account={sheet.kind === "account" ? sheet.item : null}
        institutions={institutions}
        defaultCurrency={defaultCurrency}
      />
      <CardSheet
        open={sheet.kind === "card"}
        onOpenChange={(open) => {
          if (!open) closeSheet()
        }}
        card={sheet.kind === "card" ? sheet.item : null}
        institutions={institutions}
        accounts={accounts}
        defaultCurrency={defaultCurrency}
        onUpdateBalance={(item) => setSheet({ kind: "card-balance", item })}
      />
      <CardBalanceSheet
        open={sheet.kind === "card-balance"}
        onOpenChange={(open) => {
          if (!open) closeSheet()
        }}
        card={sheet.kind === "card-balance" ? sheet.item : null}
        defaultCurrency={defaultCurrency}
      />
    </>
  )
}
