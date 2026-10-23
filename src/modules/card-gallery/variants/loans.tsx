import { LoanProgressCard } from "@/src/modules/finance/loans/components/loan-progress-card"
import {
  galleryInstitution,
  galleryLoan,
  galleryPaidLoan,
} from "@/src/modules/card-gallery/mock/finance"
import type { GalleryVariant } from "@/src/modules/card-gallery/variants/types"

const tintedInstitution = {
  name: galleryInstitution.name,
  color: galleryInstitution.color,
}

/** PROVISIONAL (#272): variants shown in the card gallery. */
export const loanVariants: readonly GalleryVariant[] = [
  {
    id: "prestamo-completa-color",
    label: "Completa con color de institución",
    propLabel: 'variant="full" · institution.color',
    height: "≈ 160 px",
    render: ({ display, notifyTap }) => (
      <LoanProgressCard
        loan={galleryLoan}
        display={display}
        institution={tintedInstitution}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "prestamo-completa-sin-color",
    label: "Completa sin color",
    propLabel: "institution = null",
    height: "≈ 160 px",
    render: ({ display, notifyTap }) => (
      <LoanProgressCard
        loan={galleryLoan}
        display={display}
        institution={null}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "prestamo-compacta",
    label: "Compacta",
    propLabel: 'variant="compact"',
    height: "≈ 64 px",
    render: ({ display, notifyTap }) => (
      <LoanProgressCard
        loan={galleryLoan}
        display={display}
        institution={tintedInstitution}
        variant="compact"
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "prestamo-inline",
    label: "Inline",
    propLabel: 'variant="inline"',
    height: "≈ 28 px",
    render: ({ display, notifyTap }) => (
      <LoanProgressCard
        loan={galleryLoan}
        display={display}
        institution={tintedInstitution}
        variant="inline"
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "prestamo-saldado",
    label: "Saldado",
    propLabel: "currentBalance = 0",
    height: "≈ 160 px",
    render: ({ display, notifyTap }) => (
      <LoanProgressCard
        loan={galleryPaidLoan}
        display={display}
        institution={tintedInstitution}
        onPress={notifyTap}
      />
    ),
  },
]
