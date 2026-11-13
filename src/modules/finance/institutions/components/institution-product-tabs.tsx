"use client"

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
  FinanceInstitution,
  FinanceLoan,
} from "@/src/modules/finance/shared/types/entities"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { useTabsBehavior } from "@/src/shared/hooks/use-tabs-behavior"
import { CreditCardIcon, HandCoinsIcon, LandmarkIcon } from "lucide-react"

export type InstitutionProductTab = "accounts" | "cards" | "loans"

type InstitutionProductTabsProps = {
  tab: InstitutionProductTab
  onTabChange: (tab: InstitutionProductTab) => void
  institution: FinanceInstitution
  isCash: boolean
  /** Loans with no bank institution; only shown on the cash detail. */
  cashLoans: FinanceLoan[]
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
  cashLoans,
  products,
  allAccounts,
  display,
  onCreate,
}: InstitutionProductTabsProps) {
  const institutionId = institution.id
  const loans = isCash ? cashLoans : products.loans
  const tabsBehavior = useTabsBehavior({
    value: tab,
    onValueChange: onTabChange,
  })

  return (
    <div className="mx-4 flex flex-col gap-3 rounded-3xl bg-background">
      <Tabs {...tabsBehavior} className="flex w-full flex-col gap-4 p-1.5">
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
          <TabsTrigger value="loans" className="rounded-2xl py-4">
            <HandCoinsIcon className="size-4 shrink-0" />
            Préstamos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="flex flex-col gap-3">
          {products.accounts.length === 0 ? (
            <InstitutionProductEmpty
              tab="accounts"
              onCreate={isCash ? undefined : onCreate.account}
              description={
                isCash
                  ? "Crea una cuenta de efectivo desde el menú de la institución."
                  : undefined
              }
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
        </TabsContent>

        {!isCash ? (
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
        ) : null}

        <TabsContent value="loans" className="flex flex-col gap-3">
          {loans.length === 0 ? (
            <InstitutionProductEmpty
              tab="loans"
              onCreate={isCash ? undefined : onCreate.loan}
              description={
                isCash
                  ? "Los préstamos sin institución bancaria aparecen aquí."
                  : undefined
              }
            />
          ) : (
            loans.map((loan) => (
              <LoanProgressCard
                key={loan.id}
                loan={loan}
                display={display}
                institution={isCash ? null : institution}
                href={APP_ROUTES.app.financeLoan(loan.id)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
