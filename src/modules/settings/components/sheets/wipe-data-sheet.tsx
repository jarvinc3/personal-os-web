"use client"

import { WipeUserDataView } from "@/src/modules/settings/components/sheets/wipe-user-data-sheet"
import type { SettingsSheetProps } from "@/src/modules/settings/types/sheet.types"
import { SheetBody } from "@/src/shared/components/sheets/sheet-body"
import { SheetHeader } from "@/src/shared/components/sheets/sheet-header"
import { SHEET_FOOTER_CLASS } from "@/src/shared/components/sheets/sheet-layout"
import { Button } from "@/src/shared/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/src/shared/components/ui/drawer"
import { XIcon } from "lucide-react"

type WipeDataSheetProps = SettingsSheetProps & {
  email: string
  title: string
  description: string
  /** Only the branches of this app; omit it to wipe every app. */
  app?: string
}

export function WipeDataSheet({
  open,
  onOpenChange,
  email,
  title,
  description,
  app,
}: WipeDataSheetProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <SheetHeader title={title} description={description} />
        <SheetBody>
          <WipeUserDataView
            email={email}
            app={app}
            onWiped={() => onOpenChange(false)}
          />
        </SheetBody>
        <DrawerFooter className={SHEET_FOOTER_CLASS}>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4 shrink-0" aria-hidden="true" />
            Cancelar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
