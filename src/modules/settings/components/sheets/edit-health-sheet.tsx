'use client';

import { ModuleSheetEnableRow } from '@/src/modules/settings/components/profile-ui';
import { MODULE_ACCENTS } from '@/src/modules/settings/constants/settings-metadata';
import { useModuleSheetEnable } from '@/src/modules/settings/hooks/use-module-sheet-enable';
import { useProfileSheetFormSync } from '@/src/modules/settings/hooks/use-profile-sheet';
import { useUserModuleConfig } from '@/src/modules/settings/hooks/use-user-module-config';
import type { SettingsSheetProps } from '@/src/modules/settings/types/sheet.types';
import { AppSheet, AppSheetFooter } from '@/src/shared/components/app-sheet';
import { FormSection, OptionRow, SwitchFieldRow } from '@/src/shared/components/form-blocks';
import { RadioGroup, RadioGroupItem } from '@/src/shared/components/ui/radio-group';
import { appToast } from '@/src/shared/lib/app-toast';
import { createSheetSubmit } from '@/src/shared/lib/sheet-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HeartPulse, Ruler } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const MODULE_ACCENT = MODULE_ACCENTS.health;

const schema = z.object({
  units: z.enum(['metric', 'imperial']),
  dashboardPeriod: z.enum(['week', 'month', 'year']),
  hideSensitiveMetrics: z.boolean(),
  goalReminders: z.boolean(),
  weeklySummary: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function EditHealthSheet({ open, onOpenChange }: SettingsSheetProps) {
  const { config, updateConfig, updateMutation } = useUserModuleConfig('health');
  const moduleEnable = useModuleSheetEnable('health');

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
      units: config.units,
      dashboardPeriod: config.dashboardPeriod,
      hideSensitiveMetrics: config.privacy.hideSensitiveMetrics,
      goalReminders: config.notifications.goalReminders,
      weeklySummary: config.notifications.weeklySummary,
    },
  });

  const units = watch('units');
  const formValues = useMemo(
    () => ({
      units: config.units,
      dashboardPeriod: config.dashboardPeriod,
      hideSensitiveMetrics: config.privacy.hideSensitiveMetrics,
      goalReminders: config.notifications.goalReminders,
      weeklySummary: config.notifications.weeklySummary,
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
        units: values.units,
        dashboardPeriod: values.dashboardPeriod,
        privacy: { hideSensitiveMetrics: values.hideSensitiveMetrics },
        notifications: {
          goalReminders: values.goalReminders,
          weeklySummary: values.weeklySummary,
        },
      },
      { isEnabled: moduleEnable.pendingEnabled },
    );
    appToast.success({ text1: 'Salud actualizado', text2: 'Configuración guardada.' });
    onOpenChange(false);
  });

  return (
    <AppSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Salud"
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
      <FormSection title="Unidades" icon={Ruler}>
        <RadioGroup
          value={units}
          onValueChange={(v) => setValue('units', v as FormValues['units'], { shouldDirty: true })}
        >
          <OptionRow
            icon={Ruler}
            iconColor={MODULE_ACCENT}
            label="Métrico"
            selected={units === 'metric'}
            onPress={() => setValue('units', 'metric', { shouldDirty: true })}
            trailing={<RadioGroupItem value="metric" />}
          />
          <OptionRow
            icon={Ruler}
            iconColor={MODULE_ACCENT}
            label="Imperial"
            selected={units === 'imperial'}
            onPress={() => setValue('units', 'imperial', { shouldDirty: true })}
            trailing={<RadioGroupItem value="imperial" />}
          />
        </RadioGroup>
      </FormSection>
      <FormSection title="Preferencias" icon={HeartPulse}>
        <Controller
          control={control}
          name="hideSensitiveMetrics"
          render={({ field }) => (
            <SwitchFieldRow
              label="Ocultar métricas sensibles"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="goalReminders"
          render={({ field }) => (
            <SwitchFieldRow label="Recordatorios de metas" checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
        <Controller
          control={control}
          name="weeklySummary"
          render={({ field }) => (
            <SwitchFieldRow label="Resumen semanal" checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
      </FormSection>
    </AppSheet>
  );
}
