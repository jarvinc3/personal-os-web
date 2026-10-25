"use client"

import {
  WipeUserDataView,
  type WipeScope,
} from "@/src/modules/settings/components/sheets/wipe-user-data-sheet"
import type { SettingsSheetProps } from "@/src/modules/settings/types/sheet.types"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { Button } from "@/src/shared/components/ui/button"
import { XIcon } from "lucide-react"

type WipeDataSheetProps = SettingsSheetProps & {
  email: string
  title: string
  description: string
  scope: WipeScope
}

export function WipeDataSheet({
  open,
  onOpenChange,
  email,
  title,
  description,
  scope,
}: WipeDataSheetProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
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
        scope={scope}
        onWiped={() => onOpenChange(false)}
      />
    </BottomSheet>
  )
}
