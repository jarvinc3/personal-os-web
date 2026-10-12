"use client"

import {
  AccountProductRow,
  CardProductRow,
} from "@/src/modules/finance/shared/components/product-rows"
import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import {
  buildDestinationPickerGroups,
  type DestinationPickerGroup,
} from "@/src/modules/finance/shared/lib/destination-picker"
import { encodeLedgerTarget } from "@/src/modules/finance/shared/lib/ledger-payloads"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceAccount,
  FinanceCard,
  FinanceInstitution,
} from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { Button } from "@/src/shared/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { ChevronLeftIcon, ChevronRightIcon, LockIcon } from "lucide-react"
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
              <p className="py-6 text-center text-sm text-muted-foreground">
                Esta institución no tiene cuentas.
              </p>
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
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Esta institución no tiene tarjetas.
                </p>
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
          {selectableGroups.map((group) => (
            <DestinationGroupRow
              key={`${group.kind}:${group.id}`}
              group={group}
              excludeTarget={excludeTarget}
              accountsOnly={accountsOnly}
              onInstitution={() => {
                setTab("accounts")
                setInstitutionId(group.id)
              }}
              onCash={() => {
                if (group.kind !== "cash") {
                  return
                }
                choose(encodeLedgerTarget("account", group.account.id))
              }}
            />
          ))}
        </div>
      )}
    </BottomSheet>
  )
}

function DestinationGroupRow({
  group,
  excludeTarget,
  accountsOnly,
  onInstitution,
  onCash,
}: {
  group: DestinationPickerGroup
  excludeTarget: string | null
  accountsOnly: boolean
  onInstitution: () => void
  onCash: () => void
}) {
  if (group.kind === "cash") {
    const taken =
      encodeLedgerTarget("account", group.account.id) === excludeTarget
    return (
      <button
        type="button"
        disabled={taken}
        className={cn(
          "relative flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3 text-left",
          taken ? "cursor-not-allowed" : PRESSABLE_CLASS
        )}
        onClick={onCash}
      >
        <BrandLogo
          name={group.account.name}
          size={36}
          className={taken ? "opacity-45" : undefined}
        />
        <span className={cn("min-w-0 flex-1", taken && "opacity-45")}>
          <span className="block truncate font-medium">
            {group.account.name}
          </span>
          <span className="block text-sm text-muted-foreground">Efectivo</span>
        </span>
        {taken ? (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <LockIcon className="size-7 text-foreground" aria-hidden />
            <span className="sr-only">En uso</span>
          </span>
        ) : null}
      </button>
    )
  }

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3 text-left",
        PRESSABLE_CLASS
      )}
      onClick={onInstitution}
    >
      <BrandLogo name={group.name} logoUrl={group.logoUrl} size={36} />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{group.name}</span>
        <span className="block text-sm text-muted-foreground">
          {accountsOnly
            ? `${group.accounts.length} cuentas`
            : `${group.accounts.length} cuentas · ${group.cards.length} tarjetas`}
        </span>
      </span>
      <ChevronRightIcon className="size-4 text-muted-foreground" />
    </button>
  )
}
