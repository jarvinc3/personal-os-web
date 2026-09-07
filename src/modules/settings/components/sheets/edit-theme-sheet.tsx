'use client';

import { SETTINGS_REGISTRY } from '@/src/modules/settings/constants/settings-metadata';
import { useProfile } from '@/src/modules/settings/hooks/use-profile';
import { getSettingValue, patchSettingValue } from '@/src/modules/settings/lib/settings-value';
import type { ThemeValue } from '@/src/modules/settings/types/profile.types';
import type { SettingsSheetProps } from '@/src/modules/settings/types/sheet.types';
import { BottomSheet } from '@/src/shared/components/layout/bottom-sheet';
import { OptionRow } from '@/src/shared/components/layout/form-blocks';
import { Button } from '@/src/shared/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/src/shared/components/ui/radio-group';
import { Spinner } from '@/src/shared/components/ui/spinner';
import { SummarySection } from '@/src/shared/components/ui/summary';
import { appToast } from '@/src/shared/lib/app-toast';
import { Palette } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';

export function EditThemeSheet({ open, onOpenChange }: SettingsSheetProps) {
  const { preferences, updatePreferences, updateProfileMutation } = useProfile();
  const { setTheme } = useTheme();
  const router = useRouter();
  const currentTheme = getSettingValue<ThemeValue>(preferences.theme);
  const [themeValue, setThemeValue] = useState<ThemeValue>(currentTheme);
  const initialThemeRef = useRef<ThemeValue>(currentTheme);
  const savedRef = useRef(false);

  const isDirty = themeValue !== currentTheme;

  const applyTheme = useCallback(
    (theme: ThemeValue) => {
      setTheme(theme === 'system' ? 'system' : theme);
    },
    [setTheme],
  );

  const resetToInitial = useCallback(() => {
    const initial = initialThemeRef.current;
    setThemeValue(initial);
    applyTheme(initial);
  }, [applyTheme]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      if (!savedRef.current) {
        resetToInitial();
      }
      onOpenChange(false);
      return;
    }

    savedRef.current = false;
    const savedTheme = getSettingValue<ThemeValue>(preferences.theme);
    initialThemeRef.current = savedTheme;
    setThemeValue(savedTheme);
    applyTheme(savedTheme);
    onOpenChange(true);
  };

  const handleThemeChange = (value: ThemeValue) => {
    setThemeValue(value);
    applyTheme(value);
  };

  const handleSave = async () => {
    savedRef.current = true;
    await updatePreferences({
      theme: patchSettingValue(preferences.theme, themeValue),
    });
    appToast.success({
      text1: 'Tema actualizado',
      text2: 'Tu preferencia de apariencia se guardó.',
    });
    onOpenChange(false);
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={handleOpenChange}
      title="Apariencia"
      description={preferences.theme.fieldGuide}
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
            className="flex-1"
            disabled={!isDirty || updateProfileMutation.isPending}
            onClick={handleSave}
          >
            {updateProfileMutation.isPending ? <Spinner data-icon="inline-start" /> : null}
            {updateProfileMutation.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        ),
      }}
    >
      <SummarySection title="Tema" icon={Palette}>
        <RadioGroup value={themeValue} onValueChange={(v) => handleThemeChange(v as ThemeValue)}>
          {SETTINGS_REGISTRY.appearance.themeOptions.map((option) => (
            <OptionRow
              key={option.value}
              icon={option.icon}
              iconColor={SETTINGS_REGISTRY.appearance.accent}
              label={option.label}
              description={option.description}
              selected={themeValue === option.value}
              onPress={() => handleThemeChange(option.value)}
              trailing={<RadioGroupItem value={option.value} />}
            />
          ))}
        </RadioGroup>
      </SummarySection>
    </BottomSheet>
  );
}
