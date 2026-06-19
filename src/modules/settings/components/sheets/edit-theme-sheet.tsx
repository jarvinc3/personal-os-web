'use client';

import {
  SETTINGS_SECTION_ACCENTS,
  THEME_OPTIONS,
} from '@/src/modules/settings/constants/settings-metadata';
import { useProfile } from '@/src/modules/settings/hooks/use-profile';
import { getSettingValue, patchSettingValue } from '@/src/modules/settings/lib/settings-value';
import type { ThemeValue } from '@/src/modules/settings/types/profile.types';
import type { SettingsSheetProps } from '@/src/modules/settings/types/sheet.types';
import { AppSheet, AppSheetFooter } from '@/src/shared/components/app-sheet';
import { FormSection, OptionRow } from '@/src/shared/components/form-blocks';
import { RadioGroup, RadioGroupItem } from '@/src/shared/components/ui/radio-group';
import { appToast } from '@/src/shared/lib/app-toast';
import { Palette } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCallback, useRef, useState } from 'react';

export function EditThemeSheet({ open, onOpenChange }: SettingsSheetProps) {
  const { preferences, updatePreferences, updateProfileMutation } = useProfile();
  const { setTheme } = useTheme();
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
    <AppSheet
      open={open}
      onOpenChange={handleOpenChange}
      title="Apariencia"
      description={preferences.theme.fieldGuide}
      footer={
        <AppSheetFooter
          isPending={updateProfileMutation.isPending}
          disabled={!isDirty}
          onSave={() => void handleSave()}
          onCancel={() => onOpenChange(false)}
        />
      }
    >
      <FormSection title="Tema" icon={Palette}>
        <RadioGroup value={themeValue} onValueChange={(v) => handleThemeChange(v as ThemeValue)}>
          {THEME_OPTIONS.map((option) => (
            <OptionRow
              key={option.value}
              icon={option.icon}
              iconColor={SETTINGS_SECTION_ACCENTS.appearance}
              label={option.label}
              description={option.description}
              selected={themeValue === option.value}
              onPress={() => handleThemeChange(option.value)}
              trailing={<RadioGroupItem value={option.value} />}
            />
          ))}
        </RadioGroup>
      </FormSection>
    </AppSheet>
  );
}
