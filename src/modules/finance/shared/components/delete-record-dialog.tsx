"use client"

import { ArchiveIcon, Trash2Icon } from "lucide-react"
import type { ReactNode } from "react"

import { ConfirmDialog } from "@/src/shared/components/feedback/confirm-dialog"
import { Button } from "@/src/shared/components/ui/button"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"

type DeleteRecordArchive = {
  label: string
  pending?: boolean
  onArchive: () => void
}

type DeleteRecordDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  recordName: string
  consequences: ReactNode
  pending?: boolean
  onConfirm: () => void
  archive?: DeleteRecordArchive
}

export function DeleteRecordDialog({
  open,
  onOpenChange,
  recordName,
  consequences,
  pending = false,
  onConfirm,
  archive,
}: DeleteRecordDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      tone="danger"
      icon={Trash2Icon}
      title={`¿Eliminar “${recordName}”?`}
      description={consequences}
      confirmLabel="Eliminar"
      confirmIcon={Trash2Icon}
      pending={pending}
      pendingLabel="Eliminando..."
      onConfirm={onConfirm}
    >
      {archive ? (
        <Button
          type="button"
          variant="outline"
          disabled={pending || archive.pending}
          className={cn("justify-start", PRESSABLE_CLASS)}
          onClick={archive.onArchive}
        >
          <ArchiveIcon className="size-4 shrink-0" aria-hidden="true" />
          {archive.label}
        </Button>
      ) : null}
    </ConfirmDialog>
  )
}
