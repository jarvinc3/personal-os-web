"use client"

import { CardStatementsSection } from "@/src/modules/finance/cards/components/card-statements-section"
import { CardPaymentSheet } from "@/src/modules/finance/cards/components/card-payment-sheet"
import { CardVisual } from "@/src/modules/finance/cards/components/card-visual"
import { CardBalanceSheet } from "@/src/modules/finance/catalog"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { MissingRecord } from "@/src/modules/finance/shared/components/layout/missing-record"
import { FinanceInstrumentMovements } from "@/src/modules/finance/transactions"
import {
  ReconciliationSheet,
  ReconciliationsSection,
} from "@/src/modules/finance/reconciliation"
import { IrregularitiesSection } from "@/src/modules/finance/integrity"
import {
  findProductDrifts,
  recalculationPayload,
} from "@/src/modules/finance/shared/lib/integrity"
import {
  useFinanceIntegrity,
  useRecalculateBalance,
} from "@/src/modules/finance/shared/hooks/use-integrity"
import { useReconciliationStatus } from "@/src/modules/finance/shared/hooks/use-reconciliations"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useCardStatements } from "@/src/modules/finance/shared/hooks/use-card-statements"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"
import {
  useArchiveCard,
  useCards,
  useDeleteCard,
  useRestoreCard,
  useUnarchiveCard,
} from "@/src/modules/finance/shared/hooks/use-cards"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { resolveCardDisplayBalances } from "@/src/modules/finance/shared/lib/card-balances"
import {
  financeErrorMessage,
  financeLoadErrorMessage,
} from "@/src/modules/finance/shared/lib/finance-error"
import { showUndoToast } from "@/src/modules/finance/shared/components/undo-toast"
import { encodeLedgerTarget } from "@/src/modules/finance/shared/lib/ledger-payloads"
import { monthKeyFromDate } from "@/src/modules/finance/shared/lib/month-window"
import { useTabsBehavior } from "@/src/shared/hooks/use-tabs-behavior"
import { RecordOptionsSheet } from "@/src/modules/finance/shared/components/record-options-sheet"
import { InstrumentHistorySheet } from "@/src/modules/finance/shared/components/instrument-history-sheet"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
import { Button } from "@/src/shared/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/src/shared/components/ui/alert-dialog"
import { Spinner } from "@/src/shared/components/ui/spinner"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs"
import {
  APP_ROUTES,
  financeTransactionNewHref,
} from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { appToast } from "@/src/shared/lib/app-toast"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import {
  ArchiveIcon,
  CreditCardIcon,
  HistoryIcon,
  LandmarkIcon,
  MoreVerticalIcon,
  PencilIcon,
  ScaleIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

type CardDetailScreenProps = {
  cardId: string
}

const CARD_DETAIL_TABS = {
  statements: "statements",
  movements: "movements",
} as const

type CardDetailTab = (typeof CARD_DETAIL_TABS)[keyof typeof CARD_DETAIL_TABS]

export function CardDetailScreen({ cardId }: CardDetailScreenProps) {
  return (
    <FinanceGate>
      <CardDetailScreenBody cardId={cardId} />
    </FinanceGate>
  )
}

function CardDetailScreenBody({ cardId }: CardDetailScreenProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isEnabled, config, formatLocale } = useFinanceEnabled()
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
    locale: formatLocale,
  }
  const [tab, setTab] = useState<CardDetailTab>(CARD_DETAIL_TABS.statements)
  const tabsBehavior = useTabsBehavior({
    value: tab,
    onValueChange: (value) => setTab(value as CardDetailTab),
  })

  const cardsQuery = useCards(isEnabled)
  const accountsQuery = useAccounts(isEnabled)
  const statementsQuery = useCardStatements(isEnabled, cardId)
  const integrityQuery = useFinanceIntegrity(isEnabled, { cardId })
  const recalculateBalance = useRecalculateBalance()
  const statements = infiniteListItems(statementsQuery.data)
  const { open: openCardBalanceSheet, setOpen: setOpenCardBalanceSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.cardBalance)
  const { open: openHistorySheet, setOpen: setOpenHistorySheet } =
    useSheetParam(FINANCE_SHEET_KEYS.cardHistory)
  const { open: openOptionsSheet, setOpen: setOpenOptionsSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.cardOptions)
  const { open: openCardPaymentSheet, setOpen: setOpenCardPaymentSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.cardPayment)
  const { open: openReconciliationSheet, setOpen: setOpenReconciliationSheet } =
    useSheetParam(FINANCE_SHEET_KEYS.cardReconciliation)

  const card =
    (cardsQuery.data ?? []).find((item) => item.id === cardId) ?? null
  const accounts = accountsQuery.data ?? []
  const balances = card ? resolveCardDisplayBalances(card, accounts) : []
  const primaryBalance = balances[0]
  const cardDisplay = {
    ...display,
    currency: primaryBalance?.currency ?? display.currency,
  }
  const isCredit = card?.type === "CREDIT"
  const cardDrifts = isCredit
    ? findProductDrifts(integrityQuery.data?.drifts ?? [], { cardId })
    : []
  const reconciliationStatusQuery = useReconciliationStatus(
    isEnabled,
    monthKeyFromDate(new Date())
  )
  const cardReconciliations = (
    reconciliationStatusQuery.data?.items ?? []
  ).filter((item) => item.kind === "card" && item.cardId === cardId)
  const archiveCard = useArchiveCard()
  const deleteCard = useDeleteCard()
  const restoreCard = useRestoreCard()
  const unarchiveCard = useUnarchiveCard()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false)

  async function onArchiveCard() {
    if (!card) {
      return
    }
    try {
      const cardId = card.id
      await archiveCard.mutateAsync(cardId)
      setOpenOptionsSheet(false)
      router.push(APP_ROUTES.app.financeProducts)
      showUndoToast("Tarjeta archivada", () =>
        unarchiveCard.mutate(cardId, {
          onError: (error) =>
            appToast.error({ text1: financeErrorMessage(error) }),
        })
      )
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  async function onDeleteCard() {
    if (!card) {
      return
    }
    try {
      const cardId = card.id
      await deleteCard.mutateAsync(cardId)
      setConfirmOpen(false)
      setOpenOptionsSheet(false)
      router.push(APP_ROUTES.app.financeProducts)
      showUndoToast("Tarjeta eliminada", () =>
        restoreCard.mutate(cardId, {
          onError: (error) =>
            appToast.error({ text1: financeErrorMessage(error) }),
        })
      )
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  usePageHeader(
    {
      variant: "secondary",
      title: card?.institutionName || card?.name || "Tarjeta",
      onBack: () => {
        router.push(
          card
            ? APP_ROUTES.app.financeInstitution(card.institutionId)
            : APP_ROUTES.app.financeProducts
        )
      },
      actions: (
        <>
          <Button
            variant="outline"
            size="icon"
            className="size-9 rounded-full border-border"
            aria-label="Opciones de la tarjeta"
            onClick={() => setOpenOptionsSheet(true)}
          >
            <MoreVerticalIcon />
          </Button>
        </>
      ),
      accentColor: card?.color ?? undefined,
    },
    [
      card?.id,
      card?.name,
      card?.institutionName,
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
      <MissingRecord
        icon={CreditCardIcon}
        title="No encontramos esta tarjeta"
        description="Puede que se haya archivado o borrado."
        backHref={APP_ROUTES.app.financeProducts}
        backLabel="Volver a Productos"
      />
    )
  }

  const movements = (
    <FinanceInstrumentMovements
      enabled={isEnabled}
      display={cardDisplay}
      sources={[{ cardId: card.id }]}
      emptyLabel="Sin movimientos"
      emptyDescription="Registra un gasto o un ingreso de esta tarjeta."
      createLabel="Movimiento"
      onCreate={() =>
        router.push(
          financeTransactionNewHref({
            type: "DEBIT",
            destination: encodeLedgerTarget("card", card.id),
            returnTo: pathname,
          })
        )
      }
    />
  )

  const upcomingCycle = card.nextStatementDate
    ? { cycleEnd: card.nextStatementDate, dueDate: card.nextPaymentDueDate }
    : null

  return (
    <>
      {cardsQuery.error ? (
        <div className="mb-3">
          <ErrorState
            message={financeLoadErrorMessage(cardsQuery.error)}
            onRetry={() => void cardsQuery.refetch()}
            isRetrying={cardsQuery.isFetching}
          />
        </div>
      ) : null}
      <div className="-mx-4 -mt-4 overflow-hidden md:-mx-6">
        <div
          className="rounded-b-3xl p-4 md:p-6"
          style={{ background: card.color ?? "#18181b" }}
        >
          <CardVisual card={card} balances={balances} display={cardDisplay} />
        </div>
      </div>
      <div className="mx-4 -mt-4 flex flex-col gap-3 rounded-3xl bg-background">
        <IrregularitiesSection
          drifts={cardDrifts}
          reconciliationItems={cardReconciliations}
          display={cardDisplay}
          driftHref={() => null}
          reconciliationHref={() =>
            `${pathname}?sheet=${FINANCE_SHEET_KEYS.cardReconciliation}`
          }
          recalculatePending={recalculateBalance.isPending}
          onRecalculate={(drift) => {
            recalculateBalance.mutate(recalculationPayload(drift), {
              onSuccess: () => appToast.success({ text1: "Saldo corregido" }),
              onError: (error) =>
                appToast.error({ text1: financeErrorMessage(error) }),
            })
          }}
        />
        {isCredit ? (
          <Tabs {...tabsBehavior} className="flex w-full flex-col gap-4 p-1.5">
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
                <ErrorState
                  message={financeLoadErrorMessage(statementsQuery.error)}
                  onRetry={() => void statementsQuery.refetch()}
                  isRetrying={statementsQuery.isFetching}
                />
              ) : null}
              <CardStatementsSection
                cardId={card.id}
                statements={statements}
                upcomingCycle={upcomingCycle}
                display={cardDisplay}
                isPending={statementsQuery.isPending}
                emptyLabel="Sin estados de cuenta"
                emptyDescription="Configura el día de cierre para seguir cada ciclo."
                createLabel="Tarjeta"
                hasNextPage={statementsQuery.hasNextPage}
                isFetchingNextPage={statementsQuery.isFetchingNextPage}
                onLoadMore={() => void statementsQuery.fetchNextPage()}
                onCreate={() =>
                  router.push(
                    `${APP_ROUTES.app.financeCardNew}?institutionId=${card.institutionId}`
                  )
                }
              />
            </TabsContent>
            <TabsContent value={CARD_DETAIL_TABS.movements}>
              {movements}
            </TabsContent>
          </Tabs>
        ) : (
          movements
        )}
        {isCredit ? (
          <ReconciliationsSection
            enabled={isEnabled}
            target={{ cardId: card.id }}
            display={cardDisplay}
          />
        ) : null}
      </div>
      <RecordOptionsSheet
        open={openOptionsSheet}
        onOpenChange={setOpenOptionsSheet}
        description={card.name}
        options={[
          ...(isCredit
            ? [
                {
                  id: "pay",
                  title: "Pagar tarjeta",
                  icon: CreditCardIcon,
                  onPress: () => setOpenCardPaymentSheet(true),
                },
                {
                  id: "reconcile",
                  title: "Conciliar",
                  icon: LandmarkIcon,
                  onPress: () => setOpenReconciliationSheet(true),
                },
              ]
            : []),
          {
            id: "edit",
            title: "Editar tarjeta",
            icon: PencilIcon,
            onPress: () => router.push(APP_ROUTES.app.financeCardEdit(card.id)),
          },
          {
            id: "balance",
            title: "Ajustar saldo",
            icon: ScaleIcon,
            onPress: () => setOpenCardBalanceSheet(true),
          },
          {
            id: "history",
            title: "Historial",
            icon: HistoryIcon,
            onPress: () => setOpenHistorySheet(true),
          },
          {
            id: "archive",
            title: "Archivar",
            icon: ArchiveIcon,
            disabled: archiveCard.isPending || deleteCard.isPending,
            onPress: () => setArchiveConfirmOpen(true),
          },
          {
            id: "delete",
            title: "Eliminar",
            icon: Trash2Icon,
            destructive: true,
            disabled: archiveCard.isPending || deleteCard.isPending,
            onPress: () => setConfirmOpen(true),
          },
        ]}
      />
      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open && !deleteCard.isPending) {
            setConfirmOpen(false)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Trash2Icon aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>¿Eliminar “{card.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminan sus movimientos y sus estados de cuenta. No se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Button
            type="button"
            variant="outline"
            disabled={deleteCard.isPending || archiveCard.isPending}
            className={cn("justify-start", PRESSABLE_CLASS)}
            onClick={() => void onArchiveCard()}
          >
            <ArchiveIcon className="size-4 shrink-0" aria-hidden="true" />
            ¿Solo ocultarla? Archivar
          </Button>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCard.isPending}>
              <XIcon className="size-4 shrink-0" aria-hidden="true" />
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteCard.isPending}
              onClick={() => void onDeleteCard()}
            >
              {deleteCard.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Trash2Icon className="size-4 shrink-0" aria-hidden="true" />
              )}
              {deleteCard.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={archiveConfirmOpen}
        onOpenChange={(open) => {
          if (!open && !archiveCard.isPending) {
            setArchiveConfirmOpen(false)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-muted text-muted-foreground">
              <ArchiveIcon aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>¿Archivar “{card.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Deja de aparecer en las listas. Puedes restaurarlo desde la
              papelera de reciclaje o con Deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={archiveCard.isPending}>
              <XIcon className="size-4 shrink-0" aria-hidden="true" />
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={archiveCard.isPending}
              onClick={() => void onArchiveCard()}
            >
              {archiveCard.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <ArchiveIcon className="size-4 shrink-0" aria-hidden="true" />
              )}
              {archiveCard.isPending ? "Archivando..." : "Archivar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <CardBalanceSheet
        open={openCardBalanceSheet}
        onOpenChange={setOpenCardBalanceSheet}
        card={card}
        defaultCurrency={config.baseCurrency}
        display={cardDisplay}
      />{" "}
      <CardPaymentSheet
        open={openCardPaymentSheet}
        onOpenChange={setOpenCardPaymentSheet}
        card={card}
        currencies={balances.map((balance) => balance.currency)}
        defaultCurrency={config.baseCurrency}
        minimumPayment={statements[0]?.minimumPayment}
        closingBalance={statements[0]?.closingBalance}
      />
      <InstrumentHistorySheet
        open={openHistorySheet}
        onOpenChange={setOpenHistorySheet}
        target={{ kind: "card", id: card.id }}
        display={cardDisplay}
        helpSheetKey={FINANCE_SHEET_KEYS.cardHistory}
      />
      <ReconciliationSheet
        open={openReconciliationSheet}
        onOpenChange={setOpenReconciliationSheet}
        target={{
          kind: "card",
          id: card.id,
          currency: cardDisplay.currency,
          name: card.name,
          balance: primaryBalance?.balance ?? "0",
        }}
        display={cardDisplay}
        helpSheetKey={FINANCE_SHEET_KEYS.cardReconciliation}
      />
    </>
  )
}
