'use client';

import { ModuleSheetEnableRow } from '@/src/modules/settings/components/profile-ui';
import {
  FINANCE_NOTIFICATION_ROWS,
  MODULE_ACCENTS,
} from '@/src/modules/settings/constants/settings-metadata';
import { useModuleSheetEnable } from '@/src/modules/settings/hooks/use-module-sheet-enable';
import { useProfileSheetFormSync } from '@/src/modules/settings/hooks/use-profile-sheet';
import { useUserModuleConfig } from '@/src/modules/settings/hooks/use-user-module-config';
import type { FinanceModuleConfig } from '@/src/modules/settings/types/module-config.types';
import type { SettingsSheetProps } from '@/src/modules/settings/types/sheet.types';
import { AppSheet, AppSheetFooter } from '@/src/shared/components/app-sheet';
import {
  FormSection,
  FormTextField,
  OptionRow,
  SwitchFieldRow,
} from '@/src/shared/components/form-blocks';
import { RadioGroup, RadioGroupItem } from '@/src/shared/components/ui/radio-group';
import { appToast } from '@/src/shared/lib/app-toast';
import { createSheetSubmit } from '@/src/shared/lib/sheet-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  BarChart3,
  CalendarCog,
  CalendarDays,
  ChartBarIcon,
  DollarSign,
  Mail,
  ScanEyeIcon,
  Tags
} from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  baseCurrency: z.string().trim().min(3, 'Moneda obligatoria'),
  weekStartsOn: z.enum(['0', '1']),
  dashboardPeriod: z.enum(['week', 'month', 'year']),
  showCents: z.boolean(),
  compactNumbers: z.boolean(),
  emailSyncEnabled: z.boolean(),
  autoCategorize: z.boolean(),
  budgetAlerts: z.boolean(),
  aiSuggestions: z.boolean(),
  transactionDetected: z.boolean(),
  monthlyReport: z.boolean(),
  cardDueDate: z.boolean(),
  unusualExpense: z.boolean(),
});

type FormValues = z.infer<typeof schema>;
const MODULE_ACCENT = MODULE_ACCENTS.finance;

const WEEK_OPTIONS = [
  { value: '1', label: 'Lunes', description: 'Semana laboral estándar.' },
  { value: '0', label: 'Domingo', description: 'Semana tipo calendario US.' },
] as const;

const PERIOD_OPTIONS: {
  value: FinanceModuleConfig['dashboardPeriod'];
  label: string;
  description: string;
}[] = [
    { value: 'week', label: 'Semana', description: 'Vista agregada por semana.' },
    { value: 'month', label: 'Mes', description: 'Vista agregada por mes.' },
    { value: 'year', label: 'Año', description: 'Vista agregada por año.' },
  ];

function configToFormValues(config: FinanceModuleConfig): FormValues {
  return {
    baseCurrency: config.baseCurrency,
    weekStartsOn: String(config.weekStartsOn) as '0' | '1',
    dashboardPeriod: config.dashboardPeriod,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
    emailSyncEnabled: config.emailSync.enabled,
    autoCategorize: config.emailSync.autoCategorize,
    budgetAlerts: config.notifications.budgetAlerts,
    aiSuggestions: config.notifications.aiSuggestions,
    transactionDetected: config.notifications.transactionDetected,
    monthlyReport: config.notifications.monthlyReport,
    cardDueDate: config.notifications.cardDueDate,
    unusualExpense: config.notifications.unusualExpense,
  };
}

export function EditFinanceSheet({ open, onOpenChange }: SettingsSheetProps) {
  const { config, updateConfig, updateMutation } = useUserModuleConfig('finance');
  const moduleEnable = useModuleSheetEnable('finance');

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: configToFormValues(config),
  });

  const weekStartsOn = watch('weekStartsOn');
  const dashboardPeriod = watch('dashboardPeriod');
  const formValues = useMemo(() => configToFormValues(config), [config]);
  useProfileSheetFormSync(open, reset, formValues);

  useEffect(() => {
    if (open) moduleEnable.syncPendingOnSheetOpen();
  }, [open, moduleEnable]);

  const submitForm = useMemo(() => createSheetSubmit(handleSubmit), [handleSubmit]);

  const onSubmit = submitForm(async (values) => {
    await updateConfig(
      {
        baseCurrency: values.baseCurrency,
        weekStartsOn: Number(values.weekStartsOn) as 0 | 1,
        dashboardPeriod: values.dashboardPeriod,
        display: { showCents: values.showCents, compactNumbers: values.compactNumbers },
        emailSync: { enabled: values.emailSyncEnabled, autoCategorize: values.autoCategorize },
        notifications: {
          budgetAlerts: values.budgetAlerts,
          aiSuggestions: values.aiSuggestions,
          transactionDetected: values.transactionDetected,
          monthlyReport: values.monthlyReport,
          cardDueDate: values.cardDueDate,
          unusualExpense: values.unusualExpense,
        },
      },
      { isEnabled: moduleEnable.pendingEnabled },
    );
    appToast.success({ text1: 'Finanzas actualizadas', text2: 'La configuración del módulo se guardó.' });
    onOpenChange(false);
  });

  return (
    <AppSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Finanzas"
      description={config.fieldGuide}
      className="sm:max-w-lg"
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
      <FormSection title="Moneda base" icon={DollarSign}>
        <Controller
          control={control}
          name="baseCurrency"
          render={({ field }) => (
            <FormTextField
              placeholder="DOP"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              disabled={updateMutation.isPending}
              error={errors.baseCurrency?.message}
            />
          )}
        />
      </FormSection>
      <FormSection title="Inicio de semana" icon={CalendarCog}>
        <RadioGroup
          value={weekStartsOn}
          onValueChange={(v) => setValue('weekStartsOn', v as '0' | '1', { shouldDirty: true })}
        >
          {WEEK_OPTIONS.map((option) => (
            <OptionRow
              key={option.value}
              icon={CalendarDays}
              iconColor={MODULE_ACCENT}
              label={option.label}
              description={option.description}
              selected={weekStartsOn === option.value}
              onPress={() => setValue('weekStartsOn', option.value, { shouldDirty: true })}
              trailing={<RadioGroupItem value={option.value} />}
            />
          ))}
        </RadioGroup>
      </FormSection>
      <FormSection title="Período del panel" icon={ChartBarIcon}>
        <RadioGroup
          value={dashboardPeriod}
          onValueChange={(v) =>
            setValue('dashboardPeriod', v as FinanceModuleConfig['dashboardPeriod'], {
              shouldDirty: true,
            })
          }
        >
          {PERIOD_OPTIONS.map((option) => (
            <OptionRow
              key={option.value}
              icon={BarChart3}
              iconColor={MODULE_ACCENT}
              label={option.label}
              description={option.description}
              selected={dashboardPeriod === option.value}
              onPress={() => setValue('dashboardPeriod', option.value, { shouldDirty: true })}
              trailing={<RadioGroupItem value={option.value} />}
            />
          ))}
        </RadioGroup>
      </FormSection>
      <FormSection title="Visualización" icon={ScanEyeIcon}>
        <Controller
          control={control}
          name="showCents"
          render={({ field }) => (
            <SwitchFieldRow label="Mostrar centavos" checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
        <Controller
          control={control}
          name="compactNumbers"
          render={({ field }) => (
            <SwitchFieldRow label="Números compactos" checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
      </FormSection>
      <FormSection title="Sincronización de email" icon={Mail}>
        <Controller
          control={control}
          name="emailSyncEnabled"
          render={({ field }) => (
            <SwitchFieldRow label="Activar sync" checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
        <Controller
          control={control}
          name="autoCategorize"
          render={({ field }) => (
            <SwitchFieldRow label="Auto-categorizar" checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
      </FormSection>
      <FormSection title="Alertas del módulo" icon={Tags}>
        {FINANCE_NOTIFICATION_ROWS.map((row) => (
          <Controller
            key={row.key}
            control={control}
            name={row.key}
            render={({ field }) => (
              <SwitchFieldRow label={row.label} checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        ))}
      </FormSection>
    </AppSheet>
  );
}
