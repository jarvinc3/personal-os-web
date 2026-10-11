"use client"

import { SETTINGS_REGISTRY } from "@/src/modules/settings/constants/settings-metadata"
import { useAiProviders } from "@/src/modules/settings/hooks/use-ai-providers"
import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import type { SettingsSheetProps } from "@/src/modules/settings/types/sheet.types"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { OptionRow } from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/src/shared/components/ui/radio-group"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { BrainCogIcon, XIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function EditAIProviderSheet({
  open,
  onOpenChange,
}: SettingsSheetProps) {
  const { preferences, updatePreferences, updateProfileMutation } = useProfile()
  const providersQuery = useAiProviders()
  const [provider, setProvider] = useState<string | null>(
    preferences.ai.defaultProvider
  )
  const router = useRouter()

  const isDirty = provider !== preferences.ai.defaultProvider

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setProvider(preferences.ai.defaultProvider)
    }
    onOpenChange(nextOpen)
  }

  const handleSave = async () => {
    await updatePreferences({
      ai: { ...preferences.ai, defaultProvider: provider },
    })
    appToast.success({
      text1: "Proveedor de IA guardado",
      text2: provider
        ? `Preferencia: ${provider}`
        : "Se usará el pool automático.",
    })
    onOpenChange(false)
  }

  const providers = providersQuery.data?.providers ?? []

  return (
    <BottomSheet
      open={open}
      onOpenChange={handleOpenChange}
      title="Proveedor"
      description="Proveedor por defecto para las respuestas de IA."
      actions={{
        close: (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
          >
            <XIcon className="size-4 shrink-0" />
            Cancelar
          </Button>
        ),
        submit: (
          <Button
            disabled={!isDirty || updateProfileMutation.isPending}
            className="flex-1"
            onClick={handleSave}
          >
            {updateProfileMutation.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : null}
            {updateProfileMutation.isPending ? "Guardando..." : "Guardar"}
          </Button>
        ),
      }}
    >
      <SummarySection title="Proveedor por defecto" icon={BrainCogIcon}>
        {providersQuery.isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <RadioGroup
            value={provider ?? "auto"}
            onValueChange={(v) => setProvider(v === "auto" ? null : v)}
          >
            <div className="flex flex-col gap-2">
              <OptionRow
                icon={SETTINGS_REGISTRY.ai.rows.providerOption.icon}
                iconColor={SETTINGS_REGISTRY.ai.accent}
                label={SETTINGS_REGISTRY.ai.defaultProviderLabel}
                description="Round-robin entre proveedores configurados"
                selected={provider === null}
                onPress={() => setProvider(null)}
                trailing={<RadioGroupItem value="auto" />}
              />
              {providers.map((item) => (
                <OptionRow
                  key={item.name}
                  icon={SETTINGS_REGISTRY.ai.rows.providerOption.icon}
                  iconColor={SETTINGS_REGISTRY.ai.accent}
                  label={item.name}
                  description={item.model}
                  selected={provider === item.name}
                  onPress={() => setProvider(item.name)}
                  trailing={<RadioGroupItem value={item.name} />}
                />
              ))}
            </div>
          </RadioGroup>
        )}
        {!providersQuery.isLoading && providers.length === 0 ? (
          <p className="pt-2 text-xs text-muted-foreground">
            No hay proveedores configurados en el servidor.
          </p>
        ) : null}
      </SummarySection>
    </BottomSheet>
  )
}
