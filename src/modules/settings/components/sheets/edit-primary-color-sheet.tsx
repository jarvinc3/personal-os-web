"use client"

import { useAppearanceDraft } from "@/src/modules/settings/hooks/use-appearance-draft"
import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import type { SettingsSheetProps } from "@/src/modules/settings/types/sheet.types"
import {
  applyPrimaryColorToDocument,
  DEFAULT_PRIMARY_COLOR,
  findPrimaryColor,
  normalizeHexColor,
  PRIMARY_COLORS,
  readableTextColor,
} from "@/src/shared/appearance"
import { SheetBody } from "@/src/shared/components/sheets/sheet-body"
import { SheetHeader } from "@/src/shared/components/sheets/sheet-header"
import { SHEET_FOOTER_CLASS } from "@/src/shared/components/sheets/sheet-layout"
import { FieldLabel } from "@/src/shared/components/ui/field"
import { Button } from "@/src/shared/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/src/shared/components/ui/drawer"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { cn } from "@/src/shared/lib/utils"
import {
  CheckIcon,
  EyeIcon,
  PaletteIcon,
  PipetteIcon,
  SaveIcon,
  XIcon,
} from "lucide-react"

const CUSTOM_COLOR_INPUT_ID = "primary-color-custom"

export function EditPrimaryColorSheet({
  open,
  onOpenChange,
}: SettingsSheetProps) {
  const { savePreferences, preferences, updateProfileMutation } = useProfile()
  const draft = useAppearanceDraft({
    open,
    savedValue: preferences.theme.primaryColor,
    applyPreview: applyPrimaryColorToDocument,
  })
  const currentOption = findPrimaryColor(draft.value)

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      draft.revert()
    }
    onOpenChange(nextOpen)
  }

  const handleColorChange = (value: string) => {
    draft.change(normalizeHexColor(value) ?? DEFAULT_PRIMARY_COLOR)
  }

  const handleSave = () => {
    savePreferences(
      { theme: { primaryColor: draft.value } },
      {
        onSuccess: () => {
          draft.clear()
          appToast.success({
            text1: "Color primario actualizado",
            text2: "Tu preferencia de apariencia se guardó.",
          })
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <SheetHeader
          title="Color primario"
          description="Botones, enlaces y acentos de toda la app."
          pending={updateProfileMutation.isPending}
        />
        <SheetBody pending={updateProfileMutation.isPending}>
          <SummarySection title="Paleta" icon={PaletteIcon}>
            <div className="grid grid-cols-4 gap-3">
              {PRIMARY_COLORS.map((option) => {
                const selected = option.hex === draft.value

                return (
                  <div
                    key={option.id}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <button
                      type="button"
                      aria-label={option.label}
                      aria-pressed={selected}
                      onClick={() => {
                        handleColorChange(option.hex)
                      }}
                      className={cn(
                        "flex size-12 items-center justify-center rounded-full border-2 transition-transform hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                        selected ? "border-foreground" : "border-transparent"
                      )}
                      style={{ backgroundColor: option.hex }}
                    >
                      {selected ? (
                        <CheckIcon
                          aria-hidden
                          className="size-5"
                          style={{ color: readableTextColor(option.hex) }}
                        />
                      ) : null}
                    </button>
                    <span className="text-[11px] text-muted-foreground">
                      {option.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </SummarySection>

          <SummarySection title="Personalizado" icon={PipetteIcon}>
            <FieldLabel
              htmlFor={CUSTOM_COLOR_INPUT_ID}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3"
            >
              <PipetteIcon
                aria-hidden
                className="size-4.5 shrink-0 text-muted-foreground"
              />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm">Elige cualquier color</span>
                <span className="text-xs text-muted-foreground">
                  El texto encima se ajusta solo.
                </span>
              </span>
              <span
                aria-hidden
                className="size-8 shrink-0 rounded-full border border-border"
                style={{ backgroundColor: draft.value }}
              />
              <input
                id={CUSTOM_COLOR_INPUT_ID}
                aria-label="Color primario personalizado"
                type="color"
                value={draft.value.toLowerCase()}
                onChange={(event) => {
                  handleColorChange(event.target.value)
                }}
                className="size-9 shrink-0 cursor-pointer rounded-full border border-border bg-transparent p-0"
              />
            </FieldLabel>
          </SummarySection>

          <SummarySection title="Vista previa" icon={EyeIcon}>
            <div className="flex flex-col gap-2">
              <div className="rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground">
                Texto sobre el color primario
              </div>
              <span className="text-xs text-muted-foreground">
                {currentOption?.label ?? "Personalizado"} · {draft.value}
              </span>
            </div>
          </SummarySection>
        </SheetBody>
        {!updateProfileMutation.isPending ? (
          <DrawerFooter className={SHEET_FOOTER_CLASS}>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => handleOpenChange(false)}
            >
              <XIcon className="size-4 shrink-0" aria-hidden="true" />
              Cancelar
            </Button>
            <Button
              className="flex-1"
              disabled={!draft.isDirty || updateProfileMutation.isPending}
              onClick={handleSave}
            >
              {updateProfileMutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <SaveIcon className="size-4 shrink-0" />
              )}
              {updateProfileMutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DrawerFooter>
        ) : null}
      </DrawerContent>
    </Drawer>
  )
}
