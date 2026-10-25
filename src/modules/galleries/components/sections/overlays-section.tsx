"use client"

import { GalleryDemo } from "@/src/modules/galleries/components/gallery-demo"
import { simulatedTap } from "@/src/modules/galleries/components/simulated-tap"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { FormTextField } from "@/src/shared/components/forms/form-text-field"
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
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import {
  CircleCheckIcon,
  SaveIcon,
  StoreIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { useState } from "react"

const SHEET_PARAM = "ejemplo"
const EDIT_SHEET_ID = "editar"
const FLOATING_SHEET_ID = "flotante"
const CONFIRM_DIALOG_ID = "confirmar"

/** Hojas y confirmaciones abiertas por la URL (#307). */
export function OverlaysSection() {
  const { open, sheetId, setOpen } = useSheetParam(SHEET_PARAM)
  const [name, setName] = useState("Comercio Ejemplo")

  const editOpen = open && sheetId === EDIT_SHEET_ID
  const floatingOpen = open && sheetId === FLOATING_SHEET_ID
  const confirmOpen = open && sheetId === CONFIRM_DIALOG_ID

  return (
    <>
      <GalleryDemo
        name="BottomSheet"
        importPath="@/src/shared/components/sheets/bottom-sheet"
        states="hoja de edición con acciones"
        note="Cada ejemplo se abre con useSheetParam: la URL cambia y Atrás la cierra."
      >
        <Button onClick={() => setOpen(true, EDIT_SHEET_ID)}>
          <StoreIcon />
          Abrir hoja de edición
        </Button>
      </GalleryDemo>

      <GalleryDemo
        name={'BottomSheet variant="floating"'}
        importPath="@/src/shared/components/sheets/bottom-sheet"
        states="evento: llegó, listo, falló"
        note="Para un aviso de evento, no para un formulario."
      >
        <Button
          variant="outline"
          onClick={() => setOpen(true, FLOATING_SHEET_ID)}
        >
          <CircleCheckIcon />
          Abrir hoja flotante
        </Button>
      </GalleryDemo>

      <GalleryDemo
        name="AlertDialog"
        importPath="@/src/shared/components/ui/alert-dialog"
        states="confirmación de una acción destructiva"
        note="Esc y Cancelar cierran sin ejecutar; el clic afuera no cierra."
      >
        <Button
          variant="destructive"
          onClick={() => setOpen(true, CONFIRM_DIALOG_ID)}
        >
          <Trash2Icon />
          Abrir confirmación
        </Button>
      </GalleryDemo>

      <BottomSheet
        open={editOpen}
        onOpenChange={setOpen}
        title="Editar comercio"
        description="Los cambios se guardan al confirmar."
        actions={{
          close: (
            <Button variant="outline" onClick={() => setOpen(false)}>
              <XIcon />
              Cancelar
            </Button>
          ),
          submit: (
            <Button onClick={() => simulatedTap("Guardar comercio")}>
              <SaveIcon />
              Guardar
            </Button>
          ),
        }}
      >
        <FormTextField
          label="Nombre"
          value={name}
          onChange={setName}
          icon={StoreIcon}
        />
      </BottomSheet>

      <BottomSheet
        variant="floating"
        open={floatingOpen}
        onOpenChange={setOpen}
        title="Sincronización completada"
        description="Se importaron 12 movimientos del correo."
        actions={{
          submit: (
            <Button onClick={() => setOpen(false)}>
              <CircleCheckIcon />
              Entendido
            </Button>
          ),
        }}
      >
        <p className="text-sm text-muted-foreground">
          Este es el aviso de un evento: la hoja baja como una card y no cubre
          toda la pantalla.
        </p>
      </BottomSheet>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(next) => {
          if (!next) {
            setOpen(false)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>¿Eliminar el movimiento?</AlertDialogTitle>
            <AlertDialogDescription>
              Se quitará de la lista y del saldo de la cuenta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <XIcon />
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => setOpen(false)}
            >
              <Trash2Icon />
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
