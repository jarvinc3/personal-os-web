"use client"

import {
  BrandLogo,
  CardNetworkMark,
} from "@/src/modules/finance/components/brand-logo"
import { FINANCE_CARD_TYPE_LABEL } from "@/src/modules/finance/constants/catalog"
import type { FinanceCardDisplayBalance } from "@/src/modules/finance/lib/card-balances"
import {
  formatFinanceMoney,
  parseFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/lib/money"
import type { FinanceCard } from "@/src/modules/finance/types/entities"
import { cn } from "@/src/shared/lib/utils"

type CardVisualProps = {
  card: FinanceCard
  balances: readonly FinanceCardDisplayBalance[]
  display: FinanceMoneyDisplay
}

export function CardVisual({ card, balances, display }: CardVisualProps) {
  const isCredit = card.type === "CREDIT"

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
          <span className="absolute bottom-[-55%] left-[-18%] h-28 w-[62%] -rotate-6 rounded-4xl bg-white/10" />
        </span>

        <div className="relative z-10 flex items-center justify-between gap-3">
          <p className="truncate text-sm font-semibold">
            {card.institutionName}
          </p>
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
              const available = parseFinanceMoney(balance.balance)
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
            const available = parseFinanceMoney(balance.balance)
            const creditLimit = parseFinanceMoney(balance.creditLimit ?? null)
            if (
              creditLimit === null ||
              creditLimit <= 0 ||
              available === null
            ) {
              return null
            }
            const debt = Math.max(0, creditLimit - available)
            const utilizationPct = Math.min(100, (debt / creditLimit) * 100)
            const moneyDisplay = { ...display, currency: balance.currency }
            return (
              <div
                key={balance.id}
                className="flex flex-col gap-2 rounded-2xl bg-white/10 p-3 text-white"
              >
                <div className="flex items-center justify-between gap-3 text-xs text-white/70">
                  <span>Utilización {Math.round(utilizationPct)}%</span>
                  <span>
                    Disponible {formatFinanceMoney(available, moneyDisplay)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white"
                    style={{ width: `${utilizationPct}%` }}
                  />
                </div>
                <p className="text-xs text-white/70">
                  Límite {formatFinanceMoney(creditLimit, moneyDisplay)}
                </p>
              </div>
            )
          })
        : null}
    </div>
  )
}
