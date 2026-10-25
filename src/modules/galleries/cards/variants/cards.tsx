import { CardVisual } from "@/src/modules/finance/cards/components/card-visual"
import { resolveCardDisplayBalances } from "@/src/modules/finance/shared/lib/card-balances"
import { CardProductRow } from "@/src/modules/finance/shared/components/product-rows"
import {
  galleryCheckingAccount,
  galleryCreditCard,
  galleryDebitCard,
  galleryMultiCurrencyCard,
} from "@/src/modules/galleries/cards/mock/finance"
import type { GalleryVariant } from "@/src/modules/galleries/cards/variants/types"

/** Variantes de la galería /settings/appearance/cards (#272). */
export const cardVariants: readonly GalleryVariant[] = [
  {
    id: "tarjeta-fila-credito",
    label: "Fila de lista de crédito",
    propLabel: 'CardProductRow · variant="full"',
    height: "≈ 130 px",
    render: ({ display, notifyTap }) => (
      <CardProductRow
        card={galleryCreditCard}
        accounts={[galleryCheckingAccount]}
        display={display}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "tarjeta-fila-debito",
    label: "Fila de lista de débito",
    propLabel: "card.type = DEBIT",
    height: "≈ 130 px",
    render: ({ display, notifyTap }) => (
      <CardProductRow
        card={galleryDebitCard}
        accounts={[galleryCheckingAccount]}
        display={display}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "tarjeta-detalle",
    label: "Cara de detalle",
    propLabel: "CardVisual",
    height: "≈ 340 px",
    render: ({ display }) => (
      <CardVisual
        card={galleryCreditCard}
        balances={resolveCardDisplayBalances(galleryCreditCard, [
          galleryCheckingAccount,
        ])}
        display={display}
      />
    ),
  },
  {
    id: "tarjeta-compacta",
    label: "Compacta",
    propLabel: 'variant="compact"',
    height: "≈ 64 px",
    render: ({ display, notifyTap }) => (
      <CardProductRow
        card={galleryCreditCard}
        accounts={[galleryCheckingAccount]}
        display={display}
        variant="compact"
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "tarjeta-compacta-seleccionada",
    label: "Compacta seleccionada",
    propLabel: "selected",
    height: "≈ 64 px",
    render: ({ display, notifyTap }) => (
      <CardProductRow
        card={galleryCreditCard}
        accounts={[galleryCheckingAccount]}
        display={display}
        variant="compact"
        selected
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "tarjeta-inline",
    label: "Inline",
    propLabel: 'variant="inline"',
    height: "≈ 28 px",
    render: ({ display, notifyTap }) => (
      <CardProductRow
        card={galleryCreditCard}
        accounts={[galleryCheckingAccount]}
        display={display}
        variant="inline"
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "tarjeta-varias-monedas",
    label: "Varias monedas",
    propLabel: "card.balances = DOP + USD",
    height: "≈ 160 px",
    render: ({ display, notifyTap }) => (
      <CardProductRow
        card={galleryMultiCurrencyCard}
        accounts={[galleryCheckingAccount]}
        display={display}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "tarjeta-compacta-varias-monedas",
    label: "Compacta con varias monedas",
    propLabel: "Primera moneda y «+1»",
    height: "≈ 64 px",
    render: ({ display, notifyTap }) => (
      <CardProductRow
        card={galleryMultiCurrencyCard}
        accounts={[galleryCheckingAccount]}
        display={display}
        variant="compact"
        onPress={notifyTap}
      />
    ),
  },
]
