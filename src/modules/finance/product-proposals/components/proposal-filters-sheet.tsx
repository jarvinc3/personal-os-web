"use client"

import { Field, FieldLabel } from "@/src/shared/components/ui/field"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/src/shared/components/ui/toggle-group"
import { SheetBody } from "@/src/shared/components/sheets/sheet-body"
import { SheetHeader } from "@/src/shared/components/sheets/sheet-header"
import { SHEET_FOOTER_CLASS } from "@/src/shared/components/sheets/sheet-layout"
import { Button } from "@/src/shared/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/src/shared/components/ui/drawer"
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
  XIcon,
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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <SheetHeader
          title="Filtrar propuestas"
          description="Elige el estado que quieres ver"
        />
        <SheetBody>
          <Field className="gap-1">
            <FieldLabel>Estado</FieldLabel>
            <ToggleGroup
              value={[status]}
              onValueChange={(next) => {
                if (next.length > 0) {
                  onChange(next[0])
                }
              }}
              variant="outline"
              size="lg"
              orientation="vertical"
              aria-label="Estado"
              className="w-full flex-col items-stretch"
            >
              {STATUS_OPTIONS.map((option) => (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  className="h-11 w-full flex-none justify-start rounded-full text-base"
                >
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Field>
        </SheetBody>
        <DrawerFooter className={SHEET_FOOTER_CLASS}>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4 shrink-0" aria-hidden="true" />
            Cerrar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
