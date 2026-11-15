import { ProposalCard } from "@/src/modules/finance/product-proposals/components/proposal-card"
import {
  galleryAccountProposal,
  galleryApprovedProposal,
  galleryCardProposal,
  galleryCheckingAccount,
} from "@/src/modules/galleries/cards/mock/finance"
import type { GalleryVariant } from "@/src/modules/galleries/cards/variants/types"

/** Propuesta de producto detectada en el correo, antes de aprobarla (#410). */
export const proposalVariants: readonly GalleryVariant[] = [
  {
    id: "detectado-cuenta",
    label: "Cuenta pendiente",
    propLabel: "ProposalCard con evidencia y Aprobar",
    height: "≈ 250 px",
    render: ({ display, notifyTap }) => (
      <ProposalCard
        proposal={galleryAccountProposal}
        accounts={[galleryCheckingAccount]}
        display={display}
        locale={display.locale}
        approving={false}
        discarding={false}
        onApprove={notifyTap}
        onEdit={notifyTap}
        onDiscard={notifyTap}
      />
    ),
  },
  {
    id: "detectado-tarjeta",
    label: "Tarjeta pendiente",
    propLabel: "Con la cuenta asociada",
    height: "≈ 230 px",
    render: ({ display, notifyTap }) => (
      <ProposalCard
        proposal={galleryCardProposal}
        accounts={[galleryCheckingAccount]}
        display={display}
        locale={display.locale}
        approving={false}
        discarding={false}
        onApprove={notifyTap}
        onEdit={notifyTap}
        onDiscard={notifyTap}
      />
    ),
  },
  {
    id: "detectado-aprobada",
    label: "Aprobada",
    propLabel: "Sin acciones",
    height: "≈ 220 px",
    render: ({ display, notifyTap }) => (
      <ProposalCard
        proposal={galleryApprovedProposal}
        accounts={[galleryCheckingAccount]}
        display={display}
        locale={display.locale}
        approving={false}
        discarding={false}
        onApprove={notifyTap}
        onEdit={notifyTap}
        onDiscard={notifyTap}
      />
    ),
  },
]
