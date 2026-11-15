"use client"

import { SegmentedControl } from "@/src/shared/components/forms/segmented-control"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { PROPOSAL_STATUS_LABEL } from "@/src/modules/finance/product-proposals/lib/proposal-status"
import type { EmailProductProposalStatus } from "@/src/modules/finance/shared/types/entities"
import {
  CheckCircle2Icon,
  ClockIcon,
  LoaderCircleIcon,
  XCircleIcon,
} from "lucide-react"

const STATUS_OPTIONS = [
  { value: "PENDING", label: PROPOSAL_STATUS_LABEL.PENDING, icon: ClockIcon },
  {
    value: "APPROVING",
    label: PROPOSAL_STATUS_LABEL.APPROVING,
    icon: LoaderCircleIcon,
  },
  {
    value: "APPROVED",
    label: PROPOSAL_STATUS_LABEL.APPROVED,
    icon: CheckCircle2Icon,
  },
  {
    value: "DISCARDED",
    label: PROPOSAL_STATUS_LABEL.DISCARDED,
    icon: XCircleIcon,
  },
] as const

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
        options={[...STATUS_OPTIONS]}
      />
    </BottomSheet>
  )
}
