"use client"

import { ArchiveIcon } from "lucide-react"

import { ConfirmDialog } from "@/src/shared/components/feedback/confirm-dialog"

type ArchiveRecordDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  recordName: string
  pending?: boolean
  onConfirm: () => void
}

export function ArchiveRecordDialog({
  open,
  onOpenChange,
  recordName,
  pending = false,
  onConfirm,
}: ArchiveRecordDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={ArchiveIcon}
      title={`¿Archivar “${recordName}”?`}
      description="Deja de aparecer en las listas. Puedes restaurarlo desde la papelera de reciclaje o con Deshacer."
      confirmLabel="Archivar"
      confirmIcon={ArchiveIcon}
      pending={pending}
      pendingLabel="Archivando..."
      onConfirm={onConfirm}
    />
  )
}
