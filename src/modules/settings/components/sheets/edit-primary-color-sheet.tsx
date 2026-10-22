"use client"

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
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { FieldLabel } from "@/src/shared/components/ui/field"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
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
import { useState } from "react"

const CUSTOM_COLOR_INPUT_ID = "primary-color-custom"

export function EditPrimaryColorSheet({
  open,
  onOpenChange,
}: SettingsSheetProps) {
  const { savePreferences, preferences, updateProfileMutation } = useProfile()
  const currentColor = preferences.theme.primaryColor
  const [draftColor, setDraftColor] = useState<string | null>(null)
  const colorValue = draftColor ?? currentColor
  const isDirty = draftColor !== null && draftColor !== currentColor
  const currentOption = findPrimaryColor(colorValue)

  const revertDraft = () => {
    setDraftColor(null)
    applyPrimaryColorToDocument(currentColor)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      revertDraft()
    }
    onOpenChange(nextOpen)
  }

  const handleColorChange = (value: string) => {
    const normalized = normalizeHexColor(value) ?? DEFAULT_PRIMARY_COLOR
    setDraftColor(normalized)
    applyPrimaryColorToDocument(normalized)
  }

  const handleSave = () => {
    savePreferences(
      { theme: { primaryColor: colorValue } },
      {
        onSuccess: () => {
          setDraftColor(null)
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
    <BottomSheet
      open={open}
      onOpenChange={handleOpenChange}
      title="Color primario"
      description="Botones, enlaces y acentos de toda la app."
      actions={{
        close: (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              handleOpenChange(false)
            }}
          >
            <XIcon className="size-4 shrink-0" />
            Cancelar
          </Button>
        ),
        submit: (
          <Button
            className="flex-1"
            disabled={!isDirty || updateProfileMutation.isPending}
            onClick={handleSave}
          >
            {updateProfileMutation.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <SaveIcon className="size-4 shrink-0" />
            )}
            {updateProfileMutation.isPending ? "Guardando..." : "Guardar"}
          </Button>
        ),
      }}
    >
      <SummarySection title="Paleta" icon={PaletteIcon}>
        <div className="grid grid-cols-4 gap-3">
          {PRIMARY_COLORS.map((option) => {
            const selected = option.hex === colorValue

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
            style={{ backgroundColor: colorValue }}
          />
          <input
            id={CUSTOM_COLOR_INPUT_ID}
            aria-label="Color primario personalizado"
            type="color"
            value={colorValue.toLowerCase()}
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
            {currentOption?.label ?? "Personalizado"} · {colorValue}
          </span>
        </div>
      </SummarySection>
    </BottomSheet>
  )
}
