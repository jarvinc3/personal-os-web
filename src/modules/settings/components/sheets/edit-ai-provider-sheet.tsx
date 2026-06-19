'use client';

import {
  AI_DEFAULT_PROVIDER_LABEL,
  AI_PROVIDER_SHEET_ICONS,
  SETTINGS_SECTION_ACCENTS,
} from '@/src/modules/settings/constants/settings-metadata';
import { useAiProviders } from '@/src/modules/settings/hooks/use-ai-providers';
import { useProfile } from '@/src/modules/settings/hooks/use-profile';
import type { SettingsSheetProps } from '@/src/modules/settings/types/sheet.types';
import { AppSheet, AppSheetFooter } from '@/src/shared/components/app-sheet';
import { FormSection, OptionRow } from '@/src/shared/components/form-blocks';
import { RadioGroup, RadioGroupItem } from '@/src/shared/components/ui/radio-group';
import { Spinner } from '@/src/shared/components/ui/spinner';
import { appToast } from '@/src/shared/lib/app-toast';
import { BrainCogIcon } from 'lucide-react';
import { useState } from 'react';

export function EditAIProviderSheet({ open, onOpenChange }: SettingsSheetProps) {
  const { preferences, updatePreferences, updateProfileMutation } = useProfile();
  const providersQuery = useAiProviders();
  const [provider, setProvider] = useState<string | null>(preferences.ai.defaultProvider);

  const isDirty = provider !== preferences.ai.defaultProvider;

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setProvider(preferences.ai.defaultProvider);
    }
    onOpenChange(nextOpen);
  };

  const handleSave = async () => {
    await updatePreferences({ ai: { ...preferences.ai, defaultProvider: provider } });
    appToast.success({
      text1: 'Proveedor de IA guardado',
      text2: provider ? `Preferencia: ${provider}` : 'Se usará el pool automático.',
    });
    onOpenChange(false);
  };

  const providers = providersQuery.data?.providers ?? [];

  return (
    <AppSheet
      open={open}
      onOpenChange={handleOpenChange}
      title="Proveedor"
      description="Proveedor por defecto para las respuestas de IA."
      footer={
        <AppSheetFooter
          isPending={updateProfileMutation.isPending}
          disabled={!isDirty}
          onSave={() => void handleSave()}
          onCancel={() => onOpenChange(false)}
        />
      }
    >
      <FormSection title="Proveedor por defecto" icon={BrainCogIcon}>
        {providersQuery.isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <RadioGroup
            value={provider ?? 'auto'}
            onValueChange={(v) => setProvider(v === 'auto' ? null : v)}
          >
            <div className="flex flex-col gap-2">
              <OptionRow
                icon={AI_PROVIDER_SHEET_ICONS.automatic.icon}
                iconColor={SETTINGS_SECTION_ACCENTS.ai}
                label={AI_DEFAULT_PROVIDER_LABEL}
                description="Round-robin entre proveedores configurados"
                selected={provider === null}
                onPress={() => setProvider(null)}
                trailing={<RadioGroupItem value="auto" />}
              />
              {providers.map((item) => (
                <OptionRow
                  key={item.name}
                  icon={AI_PROVIDER_SHEET_ICONS.provider.icon}
                  iconColor={SETTINGS_SECTION_ACCENTS.ai}
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
      </FormSection>
    </AppSheet>
  );
}
