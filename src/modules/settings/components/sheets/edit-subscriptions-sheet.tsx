'use client';

import { ModuleSheetEnableRow } from '@/src/modules/settings/components/profile-ui';
import { MODULE_ACCENTS } from '@/src/modules/settings/constants/settings-metadata';
import { useModuleSheetEnable } from '@/src/modules/settings/hooks/use-module-sheet-enable';
import { useProfileSheetFormSync } from '@/src/modules/settings/hooks/use-profile-sheet';
import { useUserModuleConfig } from '@/src/modules/settings/hooks/use-user-module-config';
import type { SettingsSheetProps } from '@/src/modules/settings/types/sheet.types';
import { AppSheet, AppSheetFooter } from '@/src/shared/components/app-sheet';
import { FormSection, FormTextField, OptionRow, SwitchFieldRow } from '@/src/shared/components/form-blocks';
import { RadioGroup, RadioGroupItem } from '@/src/shared/components/ui/radio-group';
import { appToast } from '@/src/shared/lib/app-toast';
import { createSheetSubmit } from '@/src/shared/lib/sheet-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BadgeDollarSign, Bell, Layers, Wallet } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const MODULE_ACCENT = MODULE_ACCENTS.subscriptions;

const schema = z.object({
  defaultCurrency: z.string().trim().min(3),
  groupBy: z.enum(['category', 'provider', 'none']),
  renewalReminders: z.boolean(),
  priceIncreaseAlerts: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const GROUP_LABELS: Record<FormValues['groupBy'], string> = {
  category: 'Categoría',
  provider: 'Proveedor',
  none: 'Ninguno',
};

export function EditSubscriptionsSheet({ open, onOpenChange }: SettingsSheetProps) {
  const { config, updateConfig, updateMutation } = useUserModuleConfig('subscriptions');
  const moduleEnable = useModuleSheetEnable('subscriptions');

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isDirty, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      defaultCurrency: config.defaultCurrency,
      groupBy: config.groupBy,
      renewalReminders: config.notifications.renewalReminders,
      priceIncreaseAlerts: config.notifications.priceIncreaseAlerts,
    },
  });

  const groupBy = watch('groupBy');
  const formValues = useMemo(
    () => ({
      defaultCurrency: config.defaultCurrency,
      groupBy: config.groupBy,
      renewalReminders: config.notifications.renewalReminders,
      priceIncreaseAlerts: config.notifications.priceIncreaseAlerts,
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
        defaultCurrency: values.defaultCurrency,
        groupBy: values.groupBy,
        notifications: {
          renewalReminders: values.renewalReminders,
          priceIncreaseAlerts: values.priceIncreaseAlerts,
        },
      },
      { isEnabled: moduleEnable.pendingEnabled },
    );
    appToast.success({ text1: 'Suscripciones actualizado', text2: 'Configuración guardada.' });
    onOpenChange(false);
  });

  return (
    <AppSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Suscripciones"
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
      <FormSection title="Moneda" icon={BadgeDollarSign}>
        <Controller
          control={control}
          name="defaultCurrency"
          render={({ field }) => (
            <FormTextField
              placeholder="DOP"
              value={field.value}
              onChange={field.onChange}
              disabled={updateMutation.isPending}
              error={errors.defaultCurrency?.message}
            />
          )}
        />
      </FormSection>
      <FormSection title="Agrupar por" icon={Layers}>
        <RadioGroup
          value={groupBy}
          onValueChange={(v) => setValue('groupBy', v as FormValues['groupBy'], { shouldDirty: true })}
        >
          {(['category', 'provider', 'none'] as const).map((v) => (
            <OptionRow
              key={v}
              icon={Wallet}
              iconColor={MODULE_ACCENT}
              label={GROUP_LABELS[v]}
              selected={groupBy === v}
              onPress={() => setValue('groupBy', v, { shouldDirty: true })}
              trailing={<RadioGroupItem value={v} />}
            />
          ))}
        </RadioGroup>
      </FormSection>
      <FormSection title="Notificaciones" icon={Bell}>
        <Controller
          control={control}
          name="renewalReminders"
          render={({ field }) => (
            <SwitchFieldRow label="Avisos de renovación" checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
        <Controller
          control={control}
          name="priceIncreaseAlerts"
          render={({ field }) => (
            <SwitchFieldRow label="Subidas de precio" checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
      </FormSection>
    </AppSheet>
  );
}
