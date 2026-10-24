import { WealthLine } from "@/src/modules/finance/wealth/components/wealth-line"
import {
  galleryAccountWealthLine,
  galleryCardWealthLine,
  galleryCashWealthLine,
  galleryDoubtfulReceivableWealthLine,
  galleryLoanWealthLine,
  galleryReceivableWealthLine,
} from "@/src/modules/card-gallery/mock/finance"
import type { GalleryVariant } from "@/src/modules/card-gallery/variants/types"

/** Patrimonio con la card compacta de cada producto (#285). */
export const wealthVariants: readonly GalleryVariant[] = [
  {
    id: "patrimonio-cuenta",
    label: "Cuenta con descuadre",
    propLabel: "AccountProductRow compact + marcas",
    height: "≈ 90 px",
    render: ({ display, notifyTap }) => (
      <WealthLine
        line={galleryAccountWealthLine}
        display={display}
        drifts={[]}
        isLast
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "patrimonio-efectivo",
    label: "Efectivo",
    propLabel: "AccountProductRow compact",
    height: "≈ 90 px",
    render: ({ display, notifyTap }) => (
      <WealthLine
        line={galleryCashWealthLine}
        display={display}
        drifts={[]}
        isLast
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "patrimonio-tarjeta",
    label: "Tarjeta sin conciliar",
    propLabel: "CardProductRow compact · deuda de la línea",
    height: "≈ 90 px",
    render: ({ display, notifyTap }) => (
      <WealthLine
        line={galleryCardWealthLine}
        display={display}
        drifts={[]}
        isLast
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "patrimonio-prestamo",
    label: "Préstamo",
    propLabel: "LoanProgressCard compact",
    height: "≈ 90 px",
    render: ({ display, notifyTap }) => (
      <WealthLine
        line={galleryLoanWealthLine}
        display={display}
        drifts={[]}
        isLast
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "patrimonio-cobro",
    label: "Cobro",
    propLabel: "ReceivableCard compact",
    height: "≈ 90 px",
    render: ({ display, notifyTap }) => (
      <WealthLine
        line={galleryReceivableWealthLine}
        display={display}
        drifts={[]}
        isLast
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "patrimonio-cobro-dudoso",
    label: "Cobro dudoso",
    propLabel: "ReceivableCard compact · doubtful",
    height: "≈ 90 px",
    render: ({ display, notifyTap }) => (
      <WealthLine
        line={galleryDoubtfulReceivableWealthLine}
        display={display}
        drifts={[]}
        isLast
        onPress={notifyTap}
      />
    ),
  },
]
