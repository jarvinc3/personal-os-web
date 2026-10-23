import { AccountProductRow } from "@/src/modules/finance/shared/components/product-rows"
import {
  galleryCheckingAccount,
  galleryLongNameAccount,
  galleryNeutralAccount,
} from "@/src/modules/card-gallery/mock/finance"
import type { GalleryVariant } from "@/src/modules/card-gallery/variants/types"

/** Variantes de la galería /dev/cards (#272). */
export const accountVariants: readonly GalleryVariant[] = [
  {
    id: "cuenta-completa",
    label: "Completa con color",
    propLabel: 'variant="full" (por defecto)',
    height: "≈ 76 px",
    render: ({ display, notifyTap }) => (
      <AccountProductRow
        account={galleryCheckingAccount}
        display={display}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "cuenta-compacta",
    label: "Compacta",
    propLabel: 'variant="compact"',
    height: "≈ 52 px",
    render: ({ display, notifyTap }) => (
      <AccountProductRow
        account={galleryCheckingAccount}
        display={display}
        variant="compact"
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "cuenta-compacta-seleccionada",
    label: "Compacta seleccionada",
    propLabel: "selected",
    height: "≈ 52 px",
    render: ({ display, notifyTap }) => (
      <AccountProductRow
        account={galleryCheckingAccount}
        display={display}
        variant="compact"
        selected
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "cuenta-sin-color",
    label: "Completa sin color",
    propLabel: "account.color = null",
    height: "≈ 76 px",
    render: ({ display, notifyTap }) => (
      <AccountProductRow
        account={galleryNeutralAccount}
        display={display}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "cuenta-inline",
    label: "Inline",
    propLabel: 'variant="inline"',
    height: "≈ 28 px",
    render: ({ display, notifyTap }) => (
      <AccountProductRow
        account={galleryCheckingAccount}
        display={display}
        variant="inline"
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "cuenta-en-uso",
    label: "En uso",
    propLabel: "disabled",
    height: "≈ 76 px",
    render: ({ display, notifyTap }) => (
      <AccountProductRow
        account={galleryNeutralAccount}
        display={display}
        disabled
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "cuenta-nombre-largo",
    label: "Nombre largo",
    propLabel: "nombre con truncado",
    height: "≈ 52 px",
    render: ({ display, notifyTap }) => (
      <AccountProductRow
        account={galleryLongNameAccount}
        display={display}
        variant="compact"
        onPress={notifyTap}
      />
    ),
  },
]
