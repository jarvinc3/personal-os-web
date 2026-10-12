"use client"

import { ArchiveIcon, Trash2Icon } from "lucide-react"
import type { ReactNode } from "react"

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
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
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
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>{`¿Eliminar “${recordName}”?`}</AlertDialogTitle>
          <AlertDialogDescription>{consequences}</AlertDialogDescription>
        </AlertDialogHeader>
        {archive ? (
          <Button
            type="button"
            variant="outline"
            disabled={pending || archive.pending}
            className={cn("justify-start", PRESSABLE_CLASS)}
            onClick={archive.onArchive}
          >
            <ArchiveIcon className="size-4 shrink-0" />
            {archive.label}
          </Button>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={onConfirm}
          >
            {pending ? <Spinner data-icon="inline-start" /> : null}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
