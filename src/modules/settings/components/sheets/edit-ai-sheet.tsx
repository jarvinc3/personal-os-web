'use client';

import { SETTINGS_REGISTRY } from '@/src/modules/settings/constants/settings-metadata';
import { useProfile } from '@/src/modules/settings/hooks/use-profile';
import type { AIPreferences } from '@/src/modules/settings/types/profile.types';
import type { SettingsSheetProps } from '@/src/modules/settings/types/sheet.types';
import { BottomSheet } from '@/src/shared/components/layout/bottom-sheet';
import { OptionRow } from '@/src/shared/components/layout/form-blocks';
import { SummarySection } from '@/src/shared/components/layout/summary';
import { Button } from '@/src/shared/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/src/shared/components/ui/radio-group';
import { Spinner } from '@/src/shared/components/ui/spinner';
import { appToast } from '@/src/shared/lib/app-toast';
import { BrainCogIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

export function EditAISheet({ open, onOpenChange }: SettingsSheetProps) {
  const { preferences, updatePreferences, updateProfileMutation } = useProfile();
  const [tone, setTone] = useState<AIPreferences['tone']>(preferences.ai.tone);
  const router = useRouter();

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
    <BottomSheet
      open={open}
      onOpenChange={handleOpenChange}
      title="Tono de respuesta"
      description={preferences.ai.fieldGuide}
      actions={{
        close: (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
        ),
        submit: (
          <Button
            disabled={!isDirty || updateProfileMutation.isPending}
            className="flex-1"
            onClick={handleSave}
          >
            {updateProfileMutation.isPending ? <Spinner data-icon="inline-start" /> : null}
            {updateProfileMutation.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        ),
      }}
    >
      <SummarySection title="Tono de respuesta" icon={BrainCogIcon}>
        <RadioGroup value={tone} onValueChange={(v) => setTone(v as AIPreferences['tone'])}>
          {SETTINGS_REGISTRY.ai.toneOptions.map((option) => (
            <OptionRow
              key={option.value}
              icon={option.icon}
              iconColor={SETTINGS_REGISTRY.ai.accent}
              label={option.label}
              description={option.description}
              selected={tone === option.value}
              onPress={() => setTone(option.value)}
              trailing={<RadioGroupItem value={option.value} />}
            />
          ))}
        </RadioGroup>
      </SummarySection>
    </BottomSheet>
  );
}
