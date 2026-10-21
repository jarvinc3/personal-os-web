"use client"

import { WipeUserDataView } from "@/src/modules/settings/components/sheets/wipe-user-data-sheet"
import { WIPE_LAYER_ORDER } from "@/src/modules/settings/lib/wipe-layers"
import type { SettingsSheetProps } from "@/src/modules/settings/types/sheet.types"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { Button } from "@/src/shared/components/ui/button"
import { XIcon } from "lucide-react"

type WipeAllDataSheetProps = SettingsSheetProps & {
  email: string
}

export function WipeAllDataSheet({
  open,
  onOpenChange,
  email,
}: WipeAllDataSheetProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Vaciar todos los datos"
      description="Borra el contenido de todas las apps. La cuenta se conserva."
      actions={{
        close: (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4 shrink-0" />
            Cancelar
          </Button>
        ),
      }}
    >
      <WipeUserDataView
        email={email}
        fixedLayers={WIPE_LAYER_ORDER}
        onWiped={() => onOpenChange(false)}
      />
    </BottomSheet>
  )
}
