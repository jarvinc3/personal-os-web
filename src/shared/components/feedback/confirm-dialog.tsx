"use client"

import { XIcon, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/src/shared/components/ui/button"

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
import { cn } from "@/src/shared/lib/utils"

const CANCEL_LABEL = "Cancelar"

export type ConfirmDialogTone = "default" | "danger"

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description: ReactNode
  confirmLabel: ReactNode
  confirmIcon: LucideIcon
  onConfirm: () => void
  tone?: ConfirmDialogTone
  /** Icono grande del encabezado; su color sigue al tono. */
  icon?: LucideIcon
  pending?: boolean
  /** Texto del botón mientras la acción corre, p. ej. «Eliminando...». */
  pendingLabel?: ReactNode
  cancelLabel?: string
  confirmDisabled?: boolean
  /** Caja ancha, para un diálogo con un formulario dentro. */
  wide?: boolean
  /** Sube la capa cuando el diálogo se abre sobre otro overlay. */
  layerClassName?: string
  /** Deja el diálogo abierto al confirmar para una acción asíncrona; lo cierra el caller. */
  closeOnConfirm?: boolean
  children?: ReactNode
}

/**
 * The one confirmation of the app: Esc and Cancelar cancel, a click outside does
 * not, and the action tone marks what is destructive.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  confirmIcon: ConfirmIcon,
  onConfirm,
  tone = "default",
  icon: MediaIcon,
  pending = false,
  pendingLabel,
  cancelLabel = CANCEL_LABEL,
  confirmDisabled = false,
  wide = false,
  layerClassName,
  closeOnConfirm = true,
  children,
}: ConfirmDialogProps) {
  const actionContent = (
    <>
      {pending ? (
        <Spinner data-icon="inline-start" />
      ) : (
        <ConfirmIcon className="size-4 shrink-0" aria-hidden="true" />
      )}
      {pending && pendingLabel ? pendingLabel : confirmLabel}
    </>
  )

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!pending) {
          onOpenChange(nextOpen)
        }
      }}
    >
      <AlertDialogContent
        layerClassName={layerClassName}
        className={cn(wide && "sm:max-w-md")}
      >
        <AlertDialogHeader>
          {MediaIcon ? (
            <AlertDialogMedia
              className={cn(
                tone === "danger"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <MediaIcon aria-hidden="true" />
            </AlertDialogMedia>
          ) : null}
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>
            <XIcon className="size-4 shrink-0" aria-hidden="true" />
            {cancelLabel}
          </AlertDialogCancel>
          {closeOnConfirm ? (
            <AlertDialogAction
              variant={tone === "danger" ? "destructive" : "default"}
              disabled={pending || confirmDisabled}
              onClick={onConfirm}
            >
              {actionContent}
            </AlertDialogAction>
          ) : (
            <Button
              variant={tone === "danger" ? "destructive" : "default"}
              disabled={pending || confirmDisabled}
              onClick={onConfirm}
            >
              {actionContent}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
