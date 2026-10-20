"use client"

import {
  BrandLogo,
  CardNetworkMark,
} from "@/src/modules/finance/shared/components/brand-logo"
import { FINANCE_CARD_TYPE_LABEL } from "@/src/modules/finance/shared/constants/catalog"
import type { FinanceCardDisplayBalance } from "@/src/modules/finance/shared/lib/card-balances"
import { nextCycleNote } from "@/src/modules/finance/shared/lib/card-credit"
import { cardUtilization } from "@/src/modules/finance/cards/lib/card-utilization"
import {
  formatFinanceMoney,
  parseFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import type { FinanceCard } from "@/src/modules/finance/shared/types/entities"
import { cn } from "@/src/shared/lib/utils"

type CardVisualProps = {
  card: FinanceCard
  balances: readonly FinanceCardDisplayBalance[]
  display: FinanceMoneyDisplay
}

export function CardVisual({ card, balances, display }: CardVisualProps) {
  const isCredit = card.type === "CREDIT"
  const cycleNote = isCredit ? nextCycleNote(card) : null

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cn(
          "relative flex flex-col gap-6 overflow-hidden rounded-3xl p-5 text-white ring-1 ring-white/15",
          !card.color && "bg-zinc-900"
        )}
        style={card.color ? { backgroundColor: card.color } : undefined}
      >
        <span aria-hidden className="pointer-events-none absolute inset-0">
          <span className="absolute top-[-45%] right-[-12%] h-[190%] w-[38%] rotate-22 bg-black/20" />
          <span className="absolute bottom-[-45%] left-[-18%] h-28 w-[62%] -rotate-6 rounded-4xl bg-white/10" />
        </span>

        <div className="relative z-10 flex items-center justify-between gap-3">
          <p className="truncate text-sm font-semibold">{card.name}</p>
          <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold">
            {FINANCE_CARD_TYPE_LABEL[card.type]}
          </span>
        </div>

        <div className="relative z-10 flex flex-col gap-1">
          <p className="text-[10px] tracking-[0.14em] text-white/55 uppercase">
            {isCredit ? "Balance" : "Saldo actual"}
          </p>
          {balances.length === 0 ? (
            <p className="text-3xl font-bold">Sin saldo</p>
          ) : (
            balances.map((balance) => {
              const available = parseFinanceMoney(
                balance.availableCredit ?? balance.balance
              )
              const creditLimit = parseFinanceMoney(balance.creditLimit ?? null)
              const amount =
                isCredit && available !== null && creditLimit !== null
                  ? Math.max(0, creditLimit - available)
                  : available
              return (
                <p key={balance.id} className="text-3xl font-bold tabular-nums">
                  {amount === null
                    ? "Sin saldo"
                    : formatFinanceMoney(amount, {
                        ...display,
                        currency: balance.currency,
                      })}
                </p>
              )
            })
          )}
        </div>

        <div className="relative z-10 flex items-end justify-between gap-3">
          <p className="tracking-[0.2em] text-white/80">
            •••• {card.lastFour ?? "····"}
          </p>
          <span className="inline-flex items-center gap-1">
            <BrandLogo
              name={card.institutionName}
              logoUrl={card.institutionLogoUrl}
              size={28}
            />
            <CardNetworkMark
              network={card.network}
              logoUrl={card.networkLogoUrl}
              size={28}
            />
          </span>
        </div>
      </div>

      {isCredit
        ? balances.map((balance) => {
            const available = parseFinanceMoney(
              balance.availableCredit ?? balance.balance
            )
            const creditLimitValue = parseFinanceMoney(
              balance.creditLimit ?? null
            )
            if (creditLimitValue === null || available === null) {
              return null
            }
            const utilization = cardUtilization({
              available,
              creditLimit: creditLimitValue,
            })
            if (utilization === null) {
              return null
            }
            const moneyDisplay = { ...display, currency: balance.currency }
            return (
              <div
                key={balance.id}
                className="flex flex-col gap-2 rounded-2xl bg-white/10 p-3 text-white"
              >
                <div className="flex items-center justify-between gap-3 text-xs text-white/70">
                  <span>
                    Utilización {Math.round(utilization.utilizationPct)}%
                  </span>
                  <span>
                    Disponible {formatFinanceMoney(available, moneyDisplay)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white"
                    style={{
                      width: `${Math.min(100, utilization.utilizationPct)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-white/70">
                  Límite {formatFinanceMoney(creditLimitValue, moneyDisplay)}
                </p>
                {utilization.overdraft > 0 ? (
                  <p className="text-xs font-medium text-white">
                    Sobregiro{" "}
                    {formatFinanceMoney(utilization.overdraft, moneyDisplay)}
                  </p>
                ) : null}
              </div>
            )
          })
        : null}

      {cycleNote ? (
        <p className="px-1 text-xs text-white/70">{cycleNote}</p>
      ) : null}
    </div>
  )
}
