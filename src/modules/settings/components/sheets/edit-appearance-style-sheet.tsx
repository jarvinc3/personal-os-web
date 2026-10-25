"use client"

import { AppearanceStylePreview } from "@/src/modules/settings/components/appearance-style-preview"
import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import type { SettingsSheetProps } from "@/src/modules/settings/types/sheet.types"
import {
  APPEARANCE_STYLES,
  applyStyleToDocument,
  type AppearanceStyleId,
} from "@/src/shared/appearance"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { Button } from "@/src/shared/components/ui/button"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/src/shared/components/ui/radio-group"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { LayersIcon, SaveIcon, XIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export function EditAppearanceStyleSheet({
  open,
  onOpenChange,
}: SettingsSheetProps) {
  const { savePreferences, preferences, updateProfileMutation } = useProfile()
  const currentStyle = preferences.theme.style
  const [draftStyle, setDraftStyle] = useState<AppearanceStyleId | null>(null)
  const styleValue = draftStyle ?? currentStyle
  const isDirty = draftStyle !== null && draftStyle !== currentStyle

  // Cada apertura empieza desde lo guardado: el borrador no sobrevive al cierre.
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setDraftStyle(null)
    }
  }

  const revertDraft = () => {
    setDraftStyle(null)
    applyStyleToDocument(currentStyle)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      revertDraft()
    }
    onOpenChange(nextOpen)
  }

  const handleStyleChange = (value: AppearanceStyleId) => {
    setDraftStyle(value)
    applyStyleToDocument(value)
  }

  const handleSave = () => {
    savePreferences(
      { theme: { style: styleValue } },
      {
        onSuccess: () => {
          setDraftStyle(null)
          appToast.success({
            text1: "Estilo actualizado",
            text2: "Tu preferencia de apariencia se guardó.",
          })
          onOpenChange(false)
        },
      }
    )
  }

  // Atrás cierra la hoja por la URL, sin pasar por `onOpenChange`: el estilo
  // guardado vuelve igual cuando la hoja deja de estar abierta.
  const previewAppliedRef = useRef(false)
  useEffect(() => {
    if (open) {
      previewAppliedRef.current = true
      return
    }
    if (!previewAppliedRef.current) {
      return
    }
    previewAppliedRef.current = false
    applyStyleToDocument(currentStyle)
  }, [currentStyle, open])

  return (
    <BottomSheet
      open={open}
      onOpenChange={handleOpenChange}
      title="Estilo visual"
      description="Formas, bordes y sombras de la interfaz."
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
      <SummarySection title="Estilos disponibles" icon={LayersIcon}>
        <RadioGroup
          aria-label="Estilo visual"
          value={styleValue}
          onValueChange={(value) => {
            handleStyleChange(value as AppearanceStyleId)
          }}
          className="gap-3"
        >
          {APPEARANCE_STYLES.map((style) => (
            <RadioGroupItem
              key={style.id}
              value={style.id}
              aria-label={style.label}
              className="relative flex aspect-auto h-auto w-full flex-col items-stretch gap-3 rounded-2xl border border-border bg-card p-3 text-left after:hidden **:data-[slot=radio-group-indicator]:hidden data-checked:border-primary data-checked:bg-card data-checked:text-foreground dark:data-checked:bg-card"
            >
              <AppearanceStylePreview style={style.id} />
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{style.label}</span>
                <span className="text-xs text-muted-foreground">
                  {style.description}
                </span>
              </span>
            </RadioGroupItem>
          ))}
        </RadioGroup>
      </SummarySection>
    </BottomSheet>
  )
}
