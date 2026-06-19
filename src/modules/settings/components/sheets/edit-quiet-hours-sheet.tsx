'use client';

import { useProfile } from '@/src/modules/settings/hooks/use-profile';
import type { SettingsSheetProps } from '@/src/modules/settings/types/sheet.types';
import { AppSheet, AppSheetFooter } from '@/src/shared/components/app-sheet';
import { FormSection, FormTextField } from '@/src/shared/components/form-blocks';
import { appToast } from '@/src/shared/lib/app-toast';
import {
  formatTimeForDisplay,
  normalizeTimeToApi,
  TIME_INPUT_PLACEHOLDER,
} from '@/src/shared/lib/date-format';
import { ClockFadingIcon } from 'lucide-react';
import { useCallback, useState } from 'react';

function syncDisplayFromApi(apiTime: string) {
  return formatTimeForDisplay(apiTime);
}

export function EditQuietHoursSheet({ open, onOpenChange }: SettingsSheetProps) {
  const { preferences, updatePreferences, updateProfileMutation } = useProfile();
  const quietHours = preferences.notifications.quietHours;

  const [start, setStart] = useState(quietHours.start);
  const [end, setEnd] = useState(quietHours.end);
  const [startInput, setStartInput] = useState(() => syncDisplayFromApi(quietHours.start));
  const [endInput, setEndInput] = useState(() => syncDisplayFromApi(quietHours.end));

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setStart(quietHours.start);
      setEnd(quietHours.end);
      setStartInput(syncDisplayFromApi(quietHours.start));
      setEndInput(syncDisplayFromApi(quietHours.end));
    }
    onOpenChange(nextOpen);
  };

  const commitTimeInput = useCallback(
    (
      raw: string,
      apiValue: string,
      setApi: (value: string) => void,
      setDisplay: (value: string) => void,
    ) => {
      const normalized = normalizeTimeToApi(raw);
      if (normalized) {
        setApi(normalized);
        setDisplay(formatTimeForDisplay(normalized));
        return true;
      }
      setDisplay(syncDisplayFromApi(apiValue));
      return false;
    },
    [],
  );

  const resolvedStart = normalizeTimeToApi(startInput) ?? start;
  const resolvedEnd = normalizeTimeToApi(endInput) ?? end;
  const isDirty = resolvedStart !== quietHours.start || resolvedEnd !== quietHours.end;

  const handleSave = async () => {
    const nextStart = normalizeTimeToApi(startInput);
    const nextEnd = normalizeTimeToApi(endInput);
    if (!nextStart || !nextEnd) {
      appToast.error({
        text1: 'Horario no válido',
        text2: 'Usa un formato como 10:00 p.m.',
      });
      return;
    }

    await updatePreferences({
      notifications: {
        ...preferences.notifications,
        quietHours: { ...quietHours, start: nextStart, end: nextEnd },
      },
    });
    appToast.success({
      text1: 'Horario silencioso guardado',
      text2: 'Las horas de inicio y fin se actualizaron.',
    });
    onOpenChange(false);
  };

  return (
    <AppSheet
      open={open}
      onOpenChange={handleOpenChange}
      title="Horario silencioso"
      description="Fuera de este rango se respetan los canales globales de notificación."
      footer={
        <AppSheetFooter
          isPending={updateProfileMutation.isPending}
          disabled={!isDirty}
          onSave={() => void handleSave()}
          onCancel={() => onOpenChange(false)}
        />
      }
    >
      <FormSection title="Horario" icon={ClockFadingIcon}>
        <FormTextField
          label="Inicio"
          placeholder={TIME_INPUT_PLACEHOLDER}
          value={startInput}
          onChange={setStartInput}
          onBlur={() => commitTimeInput(startInput, start, setStart, setStartInput)}
          disabled={updateProfileMutation.isPending}
        />
        <FormTextField
          label="Fin"
          placeholder={TIME_INPUT_PLACEHOLDER}
          value={endInput}
          onChange={setEndInput}
          onBlur={() => commitTimeInput(endInput, end, setEnd, setEndInput)}
          disabled={updateProfileMutation.isPending}
        />
      </FormSection>
    </AppSheet>
  );
}
