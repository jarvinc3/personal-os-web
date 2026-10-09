"use client"

import { CardStatementsSection } from "@/src/modules/finance/components/cards/card-statements-section"
import { CardVisual } from "@/src/modules/finance/components/cards/card-visual"
import { CardBalanceSheet } from "@/src/modules/finance/components/catalog/card-balance-sheet"
import { CardSheet } from "@/src/modules/finance/components/catalog/card-sheet"
import { FinanceAuthenticatedPage } from "@/src/modules/finance/components/layout/finance-authenticated-page"
import { FinanceErrorState } from "@/src/modules/finance/components/layout/finance-error-state"
import { FinanceInstrumentMovements } from "@/src/modules/finance/components/transactions/finance-instrument-movements"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/constants/sheet-keys"
import { useAccounts } from "@/src/modules/finance/hooks/use-accounts"
import { useCardStatements } from "@/src/modules/finance/hooks/use-card-statements"
import { useCards } from "@/src/modules/finance/hooks/use-cards"
import { useFinanceEnabled } from "@/src/modules/finance/hooks/use-finance-enabled"
import { useInstitutions } from "@/src/modules/finance/hooks/use-institutions"
import { resolveCardDisplayBalances } from "@/src/modules/finance/lib/card-balances"
import { financeLoadErrorMessage } from "@/src/modules/finance/lib/finance-error"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { SummaryItem } from "@/src/shared/components/ui/summary"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import {
  CreditCardIcon,
  MoreVerticalIcon,
  PencilIcon,
  ScaleIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

type FinanceCardDetailClientProps = {
  cardId: string
}

const CARD_DETAIL_TABS = {
  statements: "statements",
  movements: "movements",
} as const

type CardDetailTab = (typeof CARD_DETAIL_TABS)[keyof typeof CARD_DETAIL_TABS]

export function FinanceCardDetailClient({
  cardId,
}: FinanceCardDetailClientProps) {
  return (
    <FinanceAuthenticatedPage>
      <FinanceCardDetailView cardId={cardId} />
    </FinanceAuthenticatedPage>
  )
}

function FinanceCardDetailView({ cardId }: FinanceCardDetailClientProps) {
  const router = useRouter()
  const { isEnabled, config } = useFinanceEnabled()
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }
  const [tab, setTab] = useState<CardDetailTab>(CARD_DETAIL_TABS.statements)

  const cardsQuery = useCards(isEnabled)
  const accountsQuery = useAccounts(isEnabled)
  const institutionsQuery = useInstitutions(isEnabled)
  const statementsQuery = useCardStatements(isEnabled, cardId)
  const { open: openCardSheet, setOpen: setOpenCardSheet } = useSheetParam(
    FINANCE_SHEET_KEYS.card
  )
  const { open: openCardBalanceSheet, setOpen: setOpenCardBalanceSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.cardBalance)
  const { open: openOptionsSheet, setOpen: setOpenOptionsSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.cardOptions)

  const card =
    (cardsQuery.data ?? []).find((item) => item.id === cardId) ?? null
  const accounts = accountsQuery.data ?? []
  const institutions = institutionsQuery.data ?? []
  const balances = card ? resolveCardDisplayBalances(card, accounts) : []
  const primaryBalance = balances[0]
  const cardDisplay = {
    ...display,
    currency: primaryBalance?.currency ?? display.currency,
  }
  const isCredit = card?.type === "CREDIT"

  usePageHeader(
    {
      variant: "secondary",
      title: card?.name ?? "Tarjeta",
      onBack: () => {
        router.push(
          card
            ? APP_ROUTES.app.financeInstitution(card.institutionId)
            : APP_ROUTES.app.financeAccounts
        )
      },
      actions: (
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-full"
          aria-label="Opciones de la tarjeta"
          onClick={() => setOpenOptionsSheet(true)}
        >
          <MoreVerticalIcon />
        </Button>
      ),
      accentColor: card?.color ?? undefined,
    },
    [
      card?.id,
      card?.name,
      card?.color,
      card?.institutionId,
      setOpenOptionsSheet,
    ]
  )

  if (cardsQuery.isPending && !card) {
    return <LoadingView />
  }

  if (!card) {
    return (
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CreditCardIcon />
          </EmptyMedia>
          <EmptyTitle>No encontramos esta tarjeta</EmptyTitle>
          <EmptyDescription>
            Puede que se haya archivado o borrado.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            variant="outline"
            onClick={() => router.push(APP_ROUTES.app.financeAccounts)}
          >
            Volver a Cuentas
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  const movements = (
    <FinanceInstrumentMovements
      enabled={isEnabled}
      display={cardDisplay}
      sources={[{ cardId: card.id }]}
      emptyLabel="Sin movimientos en esta tarjeta."
    />
  )

  return (
    <>
      {cardsQuery.error ? (
        <div className="mb-3">
          <FinanceErrorState
            message={financeLoadErrorMessage(cardsQuery.error)}
            onRetry={() => void cardsQuery.refetch()}
            isRetrying={cardsQuery.isFetching}
          />
        </div>
      ) : null}

      <div className="-mx-4 -mt-4 overflow-hidden md:-mx-6">
        <div
          className="rounded-b-3xl px-4 pt-6 pb-10 md:px-6"
          style={{ background: card.color ?? "#18181b" }}
        >
          <CardVisual card={card} balances={balances} display={cardDisplay} />
        </div>
      </div>

      <div className="mx-4 -mt-7 flex flex-col gap-3 rounded-3xl bg-background">
        {isCredit ? (
          <Tabs
            className="flex w-full flex-col gap-4"
            value={tab}
            onValueChange={(value) => setTab(value as CardDetailTab)}
          >
            <TabsList className="w-full rounded-2xl bg-background">
              <TabsTrigger
                value={CARD_DETAIL_TABS.statements}
                className="rounded-2xl py-4"
              >
                Estados de cuenta
              </TabsTrigger>
              <TabsTrigger
                value={CARD_DETAIL_TABS.movements}
                className="rounded-2xl py-4"
              >
                Movimientos
              </TabsTrigger>
            </TabsList>
            <TabsContent value={CARD_DETAIL_TABS.statements}>
              {statementsQuery.isError ? (
                <FinanceErrorState
                  message={financeLoadErrorMessage(statementsQuery.error)}
                  onRetry={() => void statementsQuery.refetch()}
                  isRetrying={statementsQuery.isFetching}
                />
              ) : null}
              <CardStatementsSection
                statements={statementsQuery.data ?? []}
                display={cardDisplay}
                isPending={statementsQuery.isPending}
                emptyLabel="Sin estados de cuenta cerrados."
              />
            </TabsContent>
            <TabsContent value={CARD_DETAIL_TABS.movements}>
              {movements}
            </TabsContent>
          </Tabs>
        ) : (
          movements
        )}
      </div>

      <BottomSheet
        open={openOptionsSheet}
        onOpenChange={setOpenOptionsSheet}
        title="Opciones"
        description={card.name}
      >
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <SummaryItem
            title="Editar tarjeta"
            icon={PencilIcon}
            onPress={() => setOpenCardSheet(true)}
            isLast={false}
            className="px-3"
          />
          <SummaryItem
            title="Ajustar saldo"
            icon={ScaleIcon}
            onPress={() => {
              setOpenOptionsSheet(false)
              setOpenCardBalanceSheet(true)
            }}
            isLast
            className="px-3"
          />
        </div>
      </BottomSheet>

      <CardSheet
        open={openCardSheet}
        onOpenChange={setOpenCardSheet}
        card={card}
        institutions={institutions}
        accounts={accounts}
        defaultCurrency={config.baseCurrency}
        onUpdateBalance={() => {
          setOpenCardSheet(false)
          setOpenCardBalanceSheet(true)
        }}
      />

      <CardBalanceSheet
        open={openCardBalanceSheet}
        onOpenChange={setOpenCardBalanceSheet}
        card={card}
        defaultCurrency={config.baseCurrency}
        display={cardDisplay}
      />
    </>
  )
}
