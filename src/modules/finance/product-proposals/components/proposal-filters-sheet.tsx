"use client"

import { SegmentedControl } from "@/src/shared/components/forms/segmented-control"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { PROPOSAL_STATUS_LABEL } from "@/src/modules/finance/product-proposals/lib/proposal-status"
import {
  EMAIL_PRODUCT_PROPOSAL_STATUSES,
  type EmailProductProposalStatus,
} from "@/src/modules/finance/shared/types/entities"
import {
  CheckCircle2Icon,
  ClockIcon,
  LoaderCircleIcon,
  XCircleIcon,
  type LucideIcon,
} from "lucide-react"

const STATUS_ICON: Record<EmailProductProposalStatus, LucideIcon> = {
  PENDING: ClockIcon,
  APPROVING: LoaderCircleIcon,
  APPROVED: CheckCircle2Icon,
  DISCARDED: XCircleIcon,
}

const STATUS_OPTIONS = EMAIL_PRODUCT_PROPOSAL_STATUSES.map((status) => ({
  value: status,
  label: PROPOSAL_STATUS_LABEL[status],
  icon: STATUS_ICON[status],
}))

type ProposalFiltersSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  status: EmailProductProposalStatus
  onChange: (status: EmailProductProposalStatus) => void
}

/** El estado que se ve en la lista; se aplica al tocarlo y vive en la URL. */
export function ProposalFiltersSheet({
  open,
  onOpenChange,
  status,
  onChange,
}: ProposalFiltersSheetProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Filtrar propuestas"
      description="Elige el estado que quieres ver"
      closeLabel="Cerrar"
    >
      <SegmentedControl
        label="Estado"
        ariaLabel="Estado de las propuestas"
        orientation="vertical"
        size="lg"
        fullWidth
        value={status}
        onChange={onChange}
        options={STATUS_OPTIONS}
      />
    </BottomSheet>
  )
}
