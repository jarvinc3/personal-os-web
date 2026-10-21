"use client"

import { InstitutionCashBreakdown } from "@/src/modules/finance/institutions/components/institution-cash-breakdown"
import { InstitutionProductEmpty } from "@/src/modules/finance/institutions/components/institution-product-lists"
import { LoanProgressCard } from "@/src/modules/finance/loans"
import {
  AccountProductRow,
  CardProductRow,
} from "@/src/modules/finance/shared/components/product-rows"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceAccount,
  FinanceCard,
  FinanceCashSummary,
  FinanceInstitution,
  FinanceLoan,
} from "@/src/modules/finance/shared/types/entities"
import { Button } from "@/src/shared/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import {
  CreditCardIcon,
  HandCoinsIcon,
  LandmarkIcon,
  PlusIcon,
} from "lucide-react"

export type InstitutionProductTab = "accounts" | "cards" | "loans"

type InstitutionProductTabsProps = {
  tab: InstitutionProductTab
  onTabChange: (tab: InstitutionProductTab) => void
  institution: FinanceInstitution
  isCash: boolean
  cash: FinanceCashSummary | null
  products: {
    accounts: FinanceAccount[]
    cards: FinanceCard[]
    loans: FinanceLoan[]
  }
  allAccounts: FinanceAccount[]
  display: FinanceMoneyDisplay
  onCreate: {
    account: () => void
    card: () => void
    loan: () => void
  }
}

export function InstitutionProductTabs({
  tab,
  onTabChange,
  institution,
  isCash,
  cash,
  products,
  allAccounts,
  display,
  onCreate,
}: InstitutionProductTabsProps) {
  const institutionId = institution.id

  return (
    <div className="mx-4 flex flex-col gap-3 rounded-3xl bg-background">
      <Tabs
        className="flex w-full flex-col gap-4 p-1.5"
        value={tab}
        onValueChange={onTabChange}
      >
        <TabsList className="w-full rounded-2xl bg-background">
          <TabsTrigger value="accounts" className="rounded-2xl py-4">
            <LandmarkIcon className="size-4 shrink-0" />
            Cuentas
          </TabsTrigger>
          {!isCash ? (
            <TabsTrigger value="cards" className="rounded-2xl py-4">
              <CreditCardIcon className="size-4 shrink-0" />
              Tarjetas
            </TabsTrigger>
          ) : null}
          {!isCash ? (
            <TabsTrigger value="loans" className="rounded-2xl py-4">
              <HandCoinsIcon className="size-4 shrink-0" />
              Préstamos
            </TabsTrigger>
          ) : null}
        </TabsList>

        <TabsContent value="accounts" className="flex flex-col gap-3">
          {isCash && cash ? (
            <InstitutionCashBreakdown cash={cash} display={display} />
          ) : null}
          {products.accounts.length === 0 ? (
            <InstitutionProductEmpty
              tab="accounts"
              onCreate={onCreate.account}
            />
          ) : (
            products.accounts.map((account) => (
              <AccountProductRow
                key={account.id}
                account={account}
                display={display}
                href={APP_ROUTES.app.financeInstitutionAccount(
                  institutionId,
                  account.id
                )}
              />
            ))
          )}
          {isCash ? (
            <Button
              variant="ghost"
              className="self-start text-muted-foreground"
              onClick={onCreate.account}
            >
              <PlusIcon className="size-4 shrink-0" />
              Agregar cuenta
            </Button>
          ) : null}
        </TabsContent>

        {!isCash ? (
          <>
            <TabsContent value="cards" className="flex flex-col gap-3">
              {products.cards.length === 0 ? (
                <InstitutionProductEmpty tab="cards" onCreate={onCreate.card} />
              ) : (
                products.cards.map((card) => (
                  <CardProductRow
                    key={card.id}
                    card={card}
                    accounts={allAccounts}
                    display={display}
                    href={
                      card.type === "DEBIT" && card.accountId
                        ? APP_ROUTES.app.financeInstitutionAccount(
                            institutionId,
                            card.accountId
                          )
                        : APP_ROUTES.app.financeInstitutionCard(
                            institutionId,
                            card.id
                          )
                    }
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="loans" className="flex flex-col gap-3">
              {products.loans.length === 0 ? (
                <InstitutionProductEmpty tab="loans" onCreate={onCreate.loan} />
              ) : (
                products.loans.map((loan) => (
                  <LoanProgressCard
                    key={loan.id}
                    loan={loan}
                    display={display}
                    institution={institution}
                    href={APP_ROUTES.app.financeLoan(loan.id)}
                  />
                ))
              )}
            </TabsContent>
          </>
        ) : null}
      </Tabs>
    </div>
  )
}
