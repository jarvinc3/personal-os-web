"use client"

import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import { CategoryCard } from "@/src/modules/finance/shared/components/category-card"
import type { FinanceSubscription } from "@/src/modules/finance/shared/types/entities"
import { nextChargeLabel } from "@/src/modules/finance/subscriptions/lib/recurring-display"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import {
  ChevronRightIcon,
  ExternalLinkIcon,
  ReceiptIcon,
  WalletIcon,
} from "lucide-react"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/src/shared/components/ui/item"
import { LinkPendingOverlay } from "@/src/shared/components/shell/navigation-pending"
import Link from "next/link"

type SubscriptionSummaryTabProps = {
  subscription: FinanceSubscription
  money: FinanceMoneyDisplay
}

export function SubscriptionSummaryTab({
  subscription,
  money,
}: SubscriptionSummaryTabProps) {
  const paymentMethodLabel = subscription.paymentMethod
    ? `${subscription.paymentMethod.name}${
        subscription.paymentMethod.last4
          ? ` ••${subscription.paymentMethod.last4}`
          : ""
      }`
    : "Sin método de pago"

  return (
    <div className="flex flex-col gap-4">
      <SummarySection title="Cobro" icon={WalletIcon}>
        <Item variant="plain" className={"border-b border-border/60"}>
          <ItemContent>
            <ItemTitle>{"Monto"}</ItemTitle>
          </ItemContent>
          <ItemActions>
            <span className="text-sm font-semibold tabular-nums">
              {formatFinanceMoney(subscription.amount, money)}
            </span>
          </ItemActions>
        </Item>
        <Item variant="plain" className={"border-b border-border/60"}>
          <ItemContent>
            <ItemTitle>{"Costo mensual"}</ItemTitle>
          </ItemContent>
          <ItemActions>
            <span className="text-sm font-semibold tabular-nums">
              {formatFinanceMoney(subscription.monthlyEquivalent, money)}
            </span>
          </ItemActions>
        </Item>
        <Item variant="plain" className={"border-b border-border/60"}>
          <ItemContent>
            <ItemTitle>{"Costo anual"}</ItemTitle>
          </ItemContent>
          <ItemActions>
            <span className="text-sm font-semibold tabular-nums">
              {formatFinanceMoney(subscription.annualEquivalent, money)}
            </span>
          </ItemActions>
        </Item>
        <Item variant="plain">
          <ItemContent>
            <ItemTitle>{"Próximo cobro"}</ItemTitle>
            <ItemDescription className="truncate text-xs">
              {formatCalendarDate(subscription.nextBillingDate, money.locale)}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <span className="text-sm font-semibold tabular-nums">
              {nextChargeLabel(subscription.daysUntil)}
            </span>
          </ItemActions>
        </Item>
      </SummarySection>

      <SummarySection title="Detalles" icon={ReceiptIcon} collapsible>
        <Item variant="plain" className={"border-b border-border/60"}>
          <ItemContent>
            <ItemTitle>{"Método de pago"}</ItemTitle>
          </ItemContent>
          <ItemActions>
            <span className="text-sm font-semibold tabular-nums">
              {paymentMethodLabel}
            </span>
          </ItemActions>
        </Item>
        <Item variant="plain" className={"border-b border-border/60"}>
          <ItemContent>
            <ItemTitle>{"Categoría"}</ItemTitle>
          </ItemContent>
          <ItemActions>
            <span className="text-sm font-semibold tabular-nums">
              {subscription.category ? (
                <CategoryCard
                  name={subscription.category.name}
                  icon={subscription.category.icon}
                  color={subscription.category.color}
                  isSystem={false}
                  variant="chip"
                />
              ) : (
                "Sin categoría"
              )}
            </span>
          </ItemActions>
        </Item>
        {subscription.trialEndsAt ? (
          <Item variant="plain" className={"border-b border-border/60"}>
            <ItemContent>
              <ItemTitle>{"Fin de la prueba"}</ItemTitle>
            </ItemContent>
            <ItemActions>
              <span className="text-sm font-semibold tabular-nums">
                {formatCalendarDate(subscription.trialEndsAt, money.locale)}
              </span>
            </ItemActions>
          </Item>
        ) : null}
        {subscription.manageUrl ? (
          <Item
            variant="default"
            render={<Link href={subscription.manageUrl} />}
          >
            <ItemMedia variant="icon">
              <ExternalLinkIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{"Enlace de gestión"}</ItemTitle>
            </ItemContent>
            <ItemActions>
              <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
              <LinkPendingOverlay />
            </ItemActions>
          </Item>
        ) : null}
        {subscription.notes ? (
          <Item variant="plain">
            <ItemContent>
              <ItemTitle>{"Notas"}</ItemTitle>
              <ItemDescription className="truncate text-xs">
                {subscription.notes}
              </ItemDescription>
            </ItemContent>
          </Item>
        ) : null}
      </SummarySection>
    </div>
  )
}
