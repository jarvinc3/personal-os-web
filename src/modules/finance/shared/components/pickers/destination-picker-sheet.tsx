"use client"

import {
  AccountProductRow,
  CardProductRow,
} from "@/src/modules/finance/shared/components/product-rows"
import { InstitutionWalletCard } from "@/src/modules/finance/products/components/institution-wallet-card"
import {
  buildCashCardFromAccount,
  buildInstitutionCardFromCatalog,
} from "@/src/modules/finance/products/lib/institution-card"
import { buildDestinationPickerGroups } from "@/src/modules/finance/shared/lib/destination-picker"
import { encodeLedgerTarget } from "@/src/modules/finance/shared/lib/ledger-payloads"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceAccount,
  FinanceCard,
  FinanceInstitution,
} from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { Button } from "@/src/shared/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs"
import { CreditCardIcon, ChevronLeftIcon, WalletIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

type DestinationPickerSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  institutions: FinanceInstitution[]
  accounts: FinanceAccount[]
  cards: FinanceCard[]
  display: FinanceMoneyDisplay
  onSelect: (destination: string) => void
  /** Ledger target already used on the other side of a transfer. */
  excludeTarget?: string | null
  /** A transfer origin is always an account, never a card. */
  accountsOnly?: boolean
}

export function DestinationPickerSheet({
  open,
  onOpenChange,
  institutions,
  accounts,
  cards,
  display,
  onSelect,
  excludeTarget = null,
  accountsOnly = false,
}: DestinationPickerSheetProps) {
  const [institutionId, setInstitutionId] = useState<string | null>(null)
  const [tab, setTab] = useState("accounts")
  const groups = useMemo(
    () => buildDestinationPickerGroups({ institutions, accounts, cards }),
    [institutions, accounts, cards]
  )
  const selectableGroups = accountsOnly
    ? groups.filter(
        (group) => group.kind === "cash" || group.accounts.length > 0
      )
    : groups
  const selected = selectableGroups.find(
    (group) => group.kind === "institution" && group.id === institutionId
  )

  useEffect(() => {
    if (open) {
      // Reset the drill-down when the sheet opens, including when it replaces
      // another picker that was open.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInstitutionId(null)
      setTab("accounts")
    }
  }, [open])

  function choose(destination: string) {
    if (excludeTarget && destination === excludeTarget) {
      return
    }
    onSelect(destination)
    onOpenChange(false)
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={
        selected?.kind === "institution"
          ? selected.name
          : accountsOnly
            ? "Cuenta"
            : "Cuenta o tarjeta"
      }
      headerActionAlign="start"
      headerAction={
        selected ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setInstitutionId(null)
              setTab("accounts")
            }}
          >
            <ChevronLeftIcon />
            Atrás
          </Button>
        ) : null
      }
    >
      {selected?.kind === "institution" ? (
        <Tabs
          persist={false}
          value={tab}
          onValueChange={(next) => {
            if (typeof next === "string") {
              setTab(next)
            }
          }}
        >
          <TabsList className="h-auto w-full rounded-2xl p-1">
            <TabsTrigger value="accounts" className="rounded-xl px-3 py-2">
              Cuentas
            </TabsTrigger>
            {accountsOnly ? null : (
              <TabsTrigger value="cards" className="rounded-xl px-3 py-2">
                Tarjetas
              </TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="accounts" className="flex flex-col gap-2">
            {selected.accounts.length === 0 ? (
              <Empty className="py-6">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <WalletIcon />
                  </EmptyMedia>
                  <EmptyTitle>Sin cuentas</EmptyTitle>
                  <EmptyDescription>
                    Esta institución no tiene cuentas.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              selected.accounts.map((account) => {
                const target = encodeLedgerTarget("account", account.id)
                return (
                  <AccountProductRow
                    key={account.id}
                    account={account}
                    display={display}
                    disabled={target === excludeTarget}
                    onPress={() => choose(target)}
                  />
                )
              })
            )}
          </TabsContent>
          {accountsOnly ? null : (
            <TabsContent value="cards" className="flex flex-col gap-2">
              {selected.cards.length === 0 ? (
                <Empty className="py-6">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <CreditCardIcon />
                    </EmptyMedia>
                    <EmptyTitle>Sin tarjetas</EmptyTitle>
                    <EmptyDescription>
                      Esta institución no tiene tarjetas.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                selected.cards.map((card) => {
                  const target = encodeLedgerTarget("card", card.id)
                  return (
                    <CardProductRow
                      key={card.id}
                      card={card}
                      accounts={accounts}
                      display={display}
                      disabled={target === excludeTarget}
                      onPress={() => choose(target)}
                    />
                  )
                })
              )}
            </TabsContent>
          )}
        </Tabs>
      ) : selectableGroups.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {accountsOnly
            ? "Crea una cuenta antes de registrar una transferencia."
            : "Crea una cuenta o una tarjeta antes de registrar un movimiento."}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {selectableGroups.map((group) =>
            group.kind === "cash" ? (
              <InstitutionWalletCard
                key={`cash:${group.id}`}
                card={buildCashCardFromAccount(group.account)}
                variant="compact"
                detail="none"
                disabled={
                  encodeLedgerTarget("account", group.account.id) ===
                  excludeTarget
                }
                onPress={() =>
                  choose(encodeLedgerTarget("account", group.account.id))
                }
              />
            ) : (
              <InstitutionWalletCard
                key={`institution:${group.id}`}
                card={buildInstitutionCardFromCatalog({
                  institution: group.institution,
                  counts: accountsOnly
                    ? { accounts: group.accounts.length }
                    : {
                        accounts: group.accounts.length,
                        cards: group.cards.length,
                      },
                })}
                variant="compact"
                detail="counts"
                onPress={() => {
                  setTab("accounts")
                  setInstitutionId(group.id)
                }}
              />
            )
          )}
        </div>
      )}
    </BottomSheet>
  )
}
