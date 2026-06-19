'use client';

import { ModuleSheetEnableRow } from '@/src/modules/settings/components/profile-ui';
import { MODULE_ACCENTS } from '@/src/modules/settings/constants/settings-metadata';
import { useModuleSheetEnable } from '@/src/modules/settings/hooks/use-module-sheet-enable';
import { useProfileSheetFormSync } from '@/src/modules/settings/hooks/use-profile-sheet';
import { useUserModuleConfig } from '@/src/modules/settings/hooks/use-user-module-config';
import type { AgendaModuleConfig } from '@/src/modules/settings/types/module-config.types';
import type { SettingsSheetProps } from '@/src/modules/settings/types/sheet.types';
import { AppSheet, AppSheetFooter } from '@/src/shared/components/app-sheet';
import { FormSection, OptionRow, SwitchFieldRow } from '@/src/shared/components/form-blocks';
import { RadioGroup, RadioGroupItem } from '@/src/shared/components/ui/radio-group';
import { appToast } from '@/src/shared/lib/app-toast';
import { createSheetSubmit } from '@/src/shared/lib/sheet-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase, CalendarCog, CalendarDays } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const MODULE_ACCENT = MODULE_ACCENTS.agenda;

const schema = z.object({
  defaultView: z.enum(['day', 'week', 'month']),
  weekStartsOn: z.enum(['0', '1']),
  defaultReminderMinutes: z.number().min(0).max(120),
  workingHoursEnabled: z.boolean(),
  eventReminders: z.boolean(),
  dailyAgenda: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const VIEW_OPTIONS: { value: AgendaModuleConfig['defaultView']; label: string }[] = [
  { value: 'day', label: 'Día' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
];

export function EditAgendaSheet({ open, onOpenChange }: SettingsSheetProps) {
  const { config, updateConfig, updateMutation } = useUserModuleConfig('agenda');
  const moduleEnable = useModuleSheetEnable('agenda');

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      defaultView: config.defaultView,
      weekStartsOn: String(config.weekStartsOn) as '0' | '1',
      defaultReminderMinutes: config.defaultReminderMinutes,
      workingHoursEnabled: config.workingHours.enabled,
      eventReminders: config.notifications.eventReminders,
      dailyAgenda: config.notifications.dailyAgenda,
    },
  });

  const defaultView = watch('defaultView');
  const weekStartsOn = watch('weekStartsOn');

  const formValues = useMemo(
    () => ({
      defaultView: config.defaultView,
      weekStartsOn: String(config.weekStartsOn) as '0' | '1',
      defaultReminderMinutes: config.defaultReminderMinutes,
      workingHoursEnabled: config.workingHours.enabled,
      eventReminders: config.notifications.eventReminders,
      dailyAgenda: config.notifications.dailyAgenda,
    }),
    [config],
  );
  useProfileSheetFormSync(open, reset, formValues);

  useEffect(() => {
    if (open) moduleEnable.syncPendingOnSheetOpen();
  }, [open, moduleEnable]);

  const submitForm = useMemo(() => createSheetSubmit(handleSubmit), [handleSubmit]);

  const onSubmit = submitForm(async (values) => {
    await updateConfig(
      {
        defaultView: values.defaultView,
        weekStartsOn: Number(values.weekStartsOn) as 0 | 1,
        defaultReminderMinutes: values.defaultReminderMinutes,
        workingHours: { ...config.workingHours, enabled: values.workingHoursEnabled },
        notifications: {
          eventReminders: values.eventReminders,
          dailyAgenda: values.dailyAgenda,
        },
      },
      { isEnabled: moduleEnable.pendingEnabled },
    );
    appToast.success({ text1: 'Agenda actualizada', text2: 'Configuración guardada.' });
    onOpenChange(false);
  });

  return (
    <AppSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Agenda"
      description={config.fieldGuide}
      footer={
        <AppSheetFooter
          isPending={updateMutation.isPending}
          disabled={moduleEnable.state !== 'unconfigured' && !isDirty && !moduleEnable.isEnabledDirty}
          onSave={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      }
    >
      <ModuleSheetEnableRow
        state={moduleEnable.state}
        isEnabled={moduleEnable.sheetEnabled}
        onEnabledChange={moduleEnable.handleEnabledChange}
        disabled={updateMutation.isPending}
      />
      <FormSection title="Vista por defecto" icon={CalendarCog}>
        <RadioGroup
          value={defaultView}
          onValueChange={(v) => setValue('defaultView', v as FormValues['defaultView'], { shouldDirty: true })}
        >
          {VIEW_OPTIONS.map((o) => (
            <OptionRow
              key={o.value}
              icon={CalendarDays}
              iconColor={MODULE_ACCENT}
              label={o.label}
              selected={defaultView === o.value}
              onPress={() => setValue('defaultView', o.value, { shouldDirty: true })}
              trailing={<RadioGroupItem value={o.value} />}
            />
          ))}
        </RadioGroup>
      </FormSection>
      <FormSection title="Semana inicia" icon={CalendarCog}>
        <RadioGroup
          value={weekStartsOn}
          onValueChange={(v) => setValue('weekStartsOn', v as '0' | '1', { shouldDirty: true })}
        >
          <OptionRow
            icon={CalendarDays}
            iconColor={MODULE_ACCENT}
            label="Lunes"
            selected={weekStartsOn === '1'}
            onPress={() => setValue('weekStartsOn', '1', { shouldDirty: true })}
            trailing={<RadioGroupItem value="1" />}
          />
          <OptionRow
            icon={CalendarDays}
            iconColor={MODULE_ACCENT}
            label="Domingo"
            selected={weekStartsOn === '0'}
            onPress={() => setValue('weekStartsOn', '0', { shouldDirty: true })}
            trailing={<RadioGroupItem value="0" />}
          />
        </RadioGroup>
      </FormSection>
      <FormSection title="Preferencias" icon={Briefcase}>
        <Controller
          control={control}
          name="workingHoursEnabled"
          render={({ field }) => (
            <SwitchFieldRow label="Horario laboral" checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
        <Controller
          control={control}
          name="eventReminders"
          render={({ field }) => (
            <SwitchFieldRow label="Recordatorios de eventos" checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
        <Controller
          control={control}
          name="dailyAgenda"
          render={({ field }) => (
            <SwitchFieldRow label="Agenda diaria" checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
      </FormSection>
    </AppSheet>
  );
}
