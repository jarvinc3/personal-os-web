import { AccountProductRow } from "@/src/modules/finance/shared/components/product-rows"
import { CardProductRow } from "@/src/modules/finance/shared/components/product-rows"
import { LoanProgressCard } from "@/src/modules/finance/loans/components/loan-progress-card"
import { TransactionMovementRow } from "@/src/modules/finance/transactions/components/transaction-movement-row"
import { BudgetCard } from "@/src/modules/finance/budgets"
import { ChatEntityBlock } from "@/src/modules/galleries/cards/drafts/chat-entity-block"
import {
  galleryBudget,
  galleryCategories,
  galleryCheckingAccount,
  galleryCreditCard,
  galleryGroceryMovement,
  galleryInstitution,
  galleryLoan,
} from "@/src/modules/galleries/cards/mock/finance"
import type { GalleryVariant } from "@/src/modules/galleries/cards/variants/types"

/** Bloques del chat con la entidad completa; referencia hasta el rediseño de chat (AI-9). */
export const chatVariants: readonly GalleryVariant[] = [
  {
    id: "chat-movimiento",
    label: "Movimiento",
    propLabel: "TransactionMovementRow full",
    height: "≈ 110 px",
    render: ({ display, notifyTap }) => (
      <ChatEntityBlock label="Movimiento encontrado">
        <TransactionMovementRow
          transaction={galleryGroceryMovement}
          categories={galleryCategories}
          display={display}
          onPress={notifyTap}
        />
      </ChatEntityBlock>
    ),
  },
  {
    id: "chat-presupuesto",
    label: "Presupuesto",
    propLabel: "BudgetCard full",
    height: "≈ 180 px",
    render: ({ display, notifyTap }) => (
      <ChatEntityBlock label="Presupuesto">
        <BudgetCard
          budget={galleryBudget}
          display={display}
          onPress={notifyTap}
        />
      </ChatEntityBlock>
    ),
  },
  {
    id: "chat-prestamo",
    label: "Préstamo",
    propLabel: "LoanProgressCard full",
    height: "≈ 180 px",
    render: ({ display, notifyTap }) => (
      <ChatEntityBlock label="Préstamo">
        <LoanProgressCard
          loan={galleryLoan}
          display={display}
          institution={{
            name: galleryInstitution.name,
            color: galleryInstitution.color,
          }}
          onPress={notifyTap}
        />
      </ChatEntityBlock>
    ),
  },
  {
    id: "chat-cuenta",
    label: "Cuenta",
    propLabel: "AccountProductRow full",
    height: "≈ 100 px",
    render: ({ display, notifyTap }) => (
      <ChatEntityBlock label="Cuenta">
        <AccountProductRow
          account={galleryCheckingAccount}
          display={display}
          onPress={notifyTap}
        />
      </ChatEntityBlock>
    ),
  },
  {
    id: "chat-tarjeta",
    label: "Tarjeta",
    propLabel: "CardProductRow full",
    height: "≈ 150 px",
    render: ({ display, notifyTap }) => (
      <ChatEntityBlock label="Tarjeta">
        <CardProductRow
          card={galleryCreditCard}
          accounts={[galleryCheckingAccount]}
          display={display}
          onPress={notifyTap}
        />
      </ChatEntityBlock>
    ),
  },
]
