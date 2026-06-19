'use client';

import {
  AI_TONE_OPTIONS,
  SETTINGS_SECTION_ACCENTS,
} from '@/src/modules/settings/constants/settings-metadata';
import { useProfile } from '@/src/modules/settings/hooks/use-profile';
import type { AIPreferences } from '@/src/modules/settings/types/profile.types';
import type { SettingsSheetProps } from '@/src/modules/settings/types/sheet.types';
import { AppSheet, AppSheetFooter } from '@/src/shared/components/app-sheet';
import { FormSection, OptionRow } from '@/src/shared/components/form-blocks';
import { RadioGroup, RadioGroupItem } from '@/src/shared/components/ui/radio-group';
import { appToast } from '@/src/shared/lib/app-toast';
import { BrainCogIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

export function EditAISheet({ open, onOpenChange }: SettingsSheetProps) {
  const { preferences, updatePreferences, updateProfileMutation } = useProfile();
  const [tone, setTone] = useState<AIPreferences['tone']>(preferences.ai.tone);

  const isDirty = useMemo(() => tone !== preferences.ai.tone, [tone, preferences.ai.tone]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setTone(preferences.ai.tone);
    }
    onOpenChange(nextOpen);
  };

  const handleSave = async () => {
    await updatePreferences({ ai: { ...preferences.ai, tone } });
    appToast.success({
      text1: 'Preferencias de IA guardadas',
      text2: 'El tono de respuesta se actualizó.',
    });
    onOpenChange(false);
  };

  return (
    <AppSheet
      open={open}
      onOpenChange={handleOpenChange}
      title="Tono de respuesta"
      description={preferences.ai.fieldGuide}
      footer={
        <AppSheetFooter
          isPending={updateProfileMutation.isPending}
          disabled={!isDirty}
          onSave={() => void handleSave()}
          onCancel={() => onOpenChange(false)}
        />
      }
    >
      <FormSection title="Tono de respuesta" icon={BrainCogIcon}>
        <RadioGroup value={tone} onValueChange={(v) => setTone(v as AIPreferences['tone'])}>
          {AI_TONE_OPTIONS.map((option) => (
            <OptionRow
              key={option.value}
              icon={option.icon}
              iconColor={SETTINGS_SECTION_ACCENTS.ai}
              label={option.label}
              description={option.description}
              selected={tone === option.value}
              onPress={() => setTone(option.value)}
              trailing={<RadioGroupItem value={option.value} />}
            />
          ))}
        </RadioGroup>
      </FormSection>
    </AppSheet>
  );
}
