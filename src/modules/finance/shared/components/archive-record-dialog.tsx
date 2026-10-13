"use client"

import { ArchiveIcon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/src/shared/components/ui/alert-dialog"
import { Spinner } from "@/src/shared/components/ui/spinner"

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
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!pending) {
          onOpenChange(nextOpen)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-muted text-muted-foreground">
            <ArchiveIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>{`¿Archivar “${recordName}”?`}</AlertDialogTitle>
          <AlertDialogDescription>
            Deja de aparecer en las listas. Puedes restaurarlo desde la papelera
            de reciclaje o con Deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction disabled={pending} onClick={onConfirm}>
            {pending ? <Spinner data-icon="inline-start" /> : null}
            Archivar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
