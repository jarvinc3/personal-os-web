"use client"

import { WipeUserDataView } from "@/src/modules/settings/components/sheets/wipe-user-data-sheet"
import type { SettingsSheetProps } from "@/src/modules/settings/types/sheet.types"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"

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
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
    >
      <WipeUserDataView
        email={email}
        app={app}
        onWiped={() => onOpenChange(false)}
      />
    </BottomSheet>
  )
}
