import { TransactionMovementRow } from "@/src/modules/finance/transactions/components/transaction-movement-row"
import { MovementDetailPreview } from "@/src/modules/card-gallery/drafts/movement-detail-preview"
import { statementMovementToTransaction } from "@/src/modules/card-gallery/drafts/statement-movement"
import {
  galleryCategories,
  galleryCheckingAccount,
  galleryCreditCard,
  galleryDuplicateMovement,
  galleryGroceryMovement,
  galleryIncomeMovement,
  galleryLargeMovement,
  galleryMerchant,
  galleryPartialMovement,
  galleryPendingMovement,
  galleryReversedMovement,
  galleryStatementMovement,
  gallerySuperCategory,
  galleryTransferMovement,
} from "@/src/modules/card-gallery/mock/finance"
import type { GalleryVariant } from "@/src/modules/card-gallery/variants/types"

const statementTransaction = statementMovementToTransaction({
  movement: galleryStatementMovement,
  card: galleryCreditCard,
})

/** Variantes de la galería /dev/cards (#272). */
export const movementVariants: readonly GalleryVariant[] = [
  {
    id: "movimiento-gasto",
    label: "Gasto",
    propLabel: 'variant="default"',
    height: "≈ 64 px",
    render: ({ display, notifyTap }) => (
      <TransactionMovementRow
        transaction={galleryGroceryMovement}
        categories={galleryCategories}
        display={display}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "movimiento-ingreso",
    label: "Ingreso",
    propLabel: 'type="CREDIT"',
    height: "≈ 64 px",
    render: ({ display, notifyTap }) => (
      <TransactionMovementRow
        transaction={galleryIncomeMovement}
        categories={galleryCategories}
        display={display}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "movimiento-transferencia",
    label: "Transferencia entre monedas",
    propLabel: "type=TRANSFER · instrument",
    height: "≈ 76 px",
    render: ({ display, notifyTap }) => (
      <TransactionMovementRow
        transaction={galleryTransferMovement}
        categories={galleryCategories}
        display={display}
        instrument={{ accountId: galleryCheckingAccount.id }}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "movimiento-pendiente",
    label: "Pendiente",
    propLabel: 'status="PENDING"',
    height: "≈ 64 px",
    render: ({ display, notifyTap }) => (
      <TransactionMovementRow
        transaction={galleryPendingMovement}
        categories={galleryCategories}
        display={display}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "movimiento-revertido",
    label: "Revertido",
    propLabel: 'status="REVERSED"',
    height: "≈ 64 px",
    render: ({ display, notifyTap }) => (
      <TransactionMovementRow
        transaction={galleryReversedMovement}
        categories={galleryCategories}
        display={display}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "movimiento-duplicado",
    label: "Con ¿Duplicado?",
    propLabel: "possibleDuplicateOfId",
    height: "≈ 76 px",
    render: ({ display, notifyTap }) => (
      <TransactionMovementRow
        transaction={galleryDuplicateMovement}
        categories={galleryCategories}
        display={display}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "movimiento-parcial",
    label: "Parcial",
    propLabel: "partial",
    height: "≈ 76 px",
    render: ({ display, notifyTap }) => (
      <TransactionMovementRow
        transaction={galleryPartialMovement}
        categories={galleryCategories}
        display={display}
        partial
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "movimiento-compacta",
    label: "Compacta",
    propLabel: 'variant="compact"',
    height: "≈ 48 px",
    render: ({ display, notifyTap }) => (
      <TransactionMovementRow
        transaction={galleryGroceryMovement}
        categories={galleryCategories}
        display={display}
        variant="compact"
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "movimiento-monto-grande",
    label: "Monto grande y negativo",
    propLabel: 'amount="1250000.00"',
    height: "≈ 64 px",
    render: ({ display, notifyTap }) => (
      <TransactionMovementRow
        transaction={galleryLargeMovement}
        categories={galleryCategories}
        display={display}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "movimiento-inline",
    label: "Inline",
    propLabel: 'variant="inline"',
    height: "≈ 28 px",
    render: ({ display, notifyTap }) => (
      <TransactionMovementRow
        transaction={galleryGroceryMovement}
        categories={galleryCategories}
        display={display}
        variant="inline"
        onPress={notifyTap}
      />
    ),
  },
]

/** Composición del detalle de movimiento; borrador hasta #283 (#272). */
export const movementDetailVariants: readonly GalleryVariant[] = [
  {
    id: "detalle-movimiento",
    label: "Encabezado y cards compactas",
    propLabel: "Composición (borrador)",
    height: "≈ 420 px",
    isDraft: true,
    render: ({ display, notifyTap }) => (
      <MovementDetailPreview
        transaction={galleryGroceryMovement}
        category={gallerySuperCategory}
        account={galleryCheckingAccount}
        card={galleryCreditCard}
        merchant={galleryMerchant}
        accounts={[galleryCheckingAccount]}
        display={display}
        onPress={notifyTap}
      />
    ),
  },
]

/** La misma fila con el modelo del estado de cuenta; borrador hasta #284 (#272). */
export const statementMovementVariants: readonly GalleryVariant[] = [
  {
    id: "estado-cuenta-fila",
    label: "Fila de estado de cuenta",
    propLabel: "statementMovementToTransaction (borrador)",
    height: "≈ 64 px",
    isDraft: true,
    render: ({ display, notifyTap }) => (
      <TransactionMovementRow
        transaction={statementTransaction}
        categories={galleryCategories}
        display={display}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "estado-cuenta-compacta",
    label: "Fila compacta del estado de cuenta",
    propLabel: 'adapter · variant="compact"',
    height: "≈ 48 px",
    isDraft: true,
    render: ({ display, notifyTap }) => (
      <TransactionMovementRow
        transaction={statementTransaction}
        categories={galleryCategories}
        display={display}
        variant="compact"
        onPress={notifyTap}
      />
    ),
  },
]
