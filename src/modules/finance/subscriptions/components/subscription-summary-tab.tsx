"use client"

import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import { CategoryCard } from "@/src/modules/finance/shared/components/category-card"
import type { FinanceSubscription } from "@/src/modules/finance/shared/types/entities"
import { nextChargeLabel } from "@/src/modules/finance/subscriptions/lib/recurring-display"
import { SummaryItem, SummarySection } from "@/src/shared/components/ui/summary"
import { ExternalLinkIcon, ReceiptIcon, WalletIcon } from "lucide-react"

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
        <SummaryItem
          title="Monto"
          value={formatFinanceMoney(subscription.amount, money)}
        />
        <SummaryItem
          title="Costo mensual"
          value={formatFinanceMoney(subscription.monthlyEquivalent, money)}
        />
        <SummaryItem
          title="Costo anual"
          value={formatFinanceMoney(subscription.annualEquivalent, money)}
        />
        <SummaryItem
          title="Próximo cobro"
          description={formatCalendarDate(
            subscription.nextBillingDate,
            money.locale
          )}
          value={nextChargeLabel(subscription.daysUntil)}
          isLast
        />
      </SummarySection>

      <SummarySection title="Detalles" icon={ReceiptIcon} collapsible>
        <SummaryItem title="Método de pago" value={paymentMethodLabel} />
        <SummaryItem
          title="Categoría"
          value={
            subscription.category ? (
              <CategoryCard
                name={subscription.category.name}
                icon={subscription.category.icon}
                color={subscription.category.color}
                isSystem={false}
                variant="chip"
              />
            ) : (
              "Sin categoría"
            )
          }
        />
        {subscription.trialEndsAt ? (
          <SummaryItem
            title="Fin de la prueba"
            value={formatCalendarDate(subscription.trialEndsAt, money.locale)}
          />
        ) : null}
        {subscription.manageUrl ? (
          <SummaryItem
            title="Enlace de gestión"
            icon={ExternalLinkIcon}
            href={subscription.manageUrl}
            showChevron
          />
        ) : null}
        {subscription.notes ? (
          <SummaryItem title="Notas" description={subscription.notes} isLast />
        ) : null}
      </SummarySection>
    </div>
  )
}
