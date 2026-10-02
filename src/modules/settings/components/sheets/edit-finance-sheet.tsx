"use client"

import { CurrencySelectField } from "@/src/modules/finance/components/catalog/currency-select-field"
import { ModuleSheetEnableRow } from "@/src/modules/settings/components/profile-ui"
import { useModuleSheetEnable } from "@/src/modules/settings/hooks/use-module-sheet-enable"
import { useProfileSheetFormSync } from "@/src/modules/settings/hooks/use-profile-sheet"
import { useUserModuleConfig } from "@/src/modules/settings/hooks/use-user-module-config"
import type { FinanceModuleConfig } from "@/src/modules/settings/types/module-config.types"
import type { SettingsSheetProps } from "@/src/modules/settings/types/sheet.types"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import {
  FormTextField,
  OptionRow,
  SwitchFieldRow,
} from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/src/shared/components/ui/radio-group"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { getModule } from "@/src/shared/constants/module-registry"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  BarChart3,
  CalendarClock,
  CalendarCog,
  CalendarDays,
  ChartBarIcon,
  Clock,
  DollarSign,
  Mail,
  ScanEyeIcon,
  Tags,
} from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { z } from "zod"

const scheduleTimePattern = /^([01]\d|2[0-3]):[0-5]\d$/

const EMAIL_SYNC_SCHEDULE_MODES = {
  INTERVAL: "interval",
  TIMES: "times",
} as const

const schema = z
  .object({
    baseCurrency: z.string().trim().min(3, "Moneda obligatoria"),
    weekStartsOn: z.enum(["0", "1"]),
    dashboardPeriod: z.enum(["week", "month", "year"]),
    showCents: z.boolean(),
    compactNumbers: z.boolean(),
    emailSyncEnabled: z.boolean(),
    emailSyncAutomatic: z.boolean(),
    emailSyncScheduleMode: z.enum([
      EMAIL_SYNC_SCHEDULE_MODES.INTERVAL,
      EMAIL_SYNC_SCHEDULE_MODES.TIMES,
    ]),
    emailSyncEveryMinutes: z.string(),
    emailSyncTimes: z.string(),
    autoCategorize: z.boolean(),
    budgetAlerts: z.boolean(),
    aiSuggestions: z.boolean(),
    transactionDetected: z.boolean(),
    monthlyReport: z.boolean(),
    cardDueDate: z.boolean(),
    unusualExpense: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.emailSyncScheduleMode === EMAIL_SYNC_SCHEDULE_MODES.INTERVAL) {
      const minutes = Number(values.emailSyncEveryMinutes)
      if (!Number.isInteger(minutes) || minutes < 15) {
        ctx.addIssue({
          code: "custom",
          path: ["emailSyncEveryMinutes"],
          message: "Mínimo 15 minutos",
        })
      }
      return
    }
    const times = values.emailSyncTimes
      .split(",")
      .map((time) => time.trim())
      .filter(Boolean)
    if (times.length === 0 || times.length > 8) {
      ctx.addIssue({
        code: "custom",
        path: ["emailSyncTimes"],
        message: "Pon de 1 a 8 horas",
      })
      return
    }
    if (times.some((time) => !scheduleTimePattern.test(time))) {
      ctx.addIssue({
        code: "custom",
        path: ["emailSyncTimes"],
        message: "Usa formato HH:MM",
      })
      return
    }
    if (new Set(times).size !== times.length) {
      ctx.addIssue({
        code: "custom",
        path: ["emailSyncTimes"],
        message: "No repitas horas",
      })
    }
  })

type FormValues = z.infer<typeof schema>
const MODULE_ACCENT = getModule("finance").accent

const FINANCE_NOTIFICATION_ROWS = [
  { key: "budgetAlerts", label: "Alertas de presupuesto" },
  { key: "aiSuggestions", label: "Sugerencias de IA" },
  { key: "transactionDetected", label: "Transacciones detectadas" },
  { key: "monthlyReport", label: "Reporte mensual" },
  { key: "cardDueDate", label: "Vencimiento de tarjetas" },
  { key: "unusualExpense", label: "Gastos inusuales" },
] as const satisfies readonly {
  key: keyof FinanceModuleConfig["notifications"]
  label: string
}[]

const WEEK_OPTIONS = [
  { value: "1", label: "Lunes", description: "Semana laboral estándar." },
  { value: "0", label: "Domingo", description: "Semana tipo calendario US." },
] as const

const PERIOD_OPTIONS: {
  value: FinanceModuleConfig["dashboardPeriod"]
  label: string
  description: string
}[] = [
  { value: "week", label: "Semana", description: "Vista agregada por semana." },
  { value: "month", label: "Mes", description: "Vista agregada por mes." },
  { value: "year", label: "Año", description: "Vista agregada por año." },
]

function configToFormValues(config: FinanceModuleConfig): FormValues {
  return {
    baseCurrency: config.baseCurrency,
    weekStartsOn: String(config.weekStartsOn) as "0" | "1",
    dashboardPeriod: config.dashboardPeriod,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
    emailSyncEnabled: config.emailSync.enabled,
    emailSyncAutomatic: config.emailSync.automatic,
    emailSyncScheduleMode: config.emailSync.schedule.mode,
    emailSyncEveryMinutes:
      config.emailSync.schedule.mode === "interval"
        ? String(config.emailSync.schedule.everyMinutes)
        : "360",
    emailSyncTimes:
      config.emailSync.schedule.mode === "times"
        ? config.emailSync.schedule.times.join(", ")
        : "08:00, 18:00",
    autoCategorize: config.emailSync.autoCategorize,
    budgetAlerts: config.notifications.budgetAlerts,
    aiSuggestions: config.notifications.aiSuggestions,
    transactionDetected: config.notifications.transactionDetected,
    monthlyReport: config.notifications.monthlyReport,
    cardDueDate: config.notifications.cardDueDate,
    unusualExpense: config.notifications.unusualExpense,
  }
}

export function EditFinanceSheet({ open, onOpenChange }: SettingsSheetProps) {
  const { config, updateConfig, updateMutation } =
    useUserModuleConfig("finance")
  const moduleEnable = useModuleSheetEnable("finance")

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: configToFormValues(config),
  })

  const weekStartsOn = useWatch({ control, name: "weekStartsOn" })
  const dashboardPeriod = useWatch({ control, name: "dashboardPeriod" })
  const emailSyncEnabledWatch = useWatch({
    control,
    name: "emailSyncEnabled",
  })
  const emailSyncScheduleMode = useWatch({
    control,
    name: "emailSyncScheduleMode",
  })
  const formValues = useMemo(() => configToFormValues(config), [config])
  useProfileSheetFormSync(open, reset, formValues)

  useEffect(() => {
    if (open) moduleEnable.syncPendingOnSheetOpen()
  }, [open, moduleEnable])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const onSubmit = submitForm(async (values) => {
    await updateConfig(
      {
        baseCurrency: values.baseCurrency,
        weekStartsOn: Number(values.weekStartsOn) as 0 | 1,
        dashboardPeriod: values.dashboardPeriod,
        display: {
          showCents: values.showCents,
          compactNumbers: values.compactNumbers,
        },
        emailSync: {
          enabled: values.emailSyncEnabled,
          automatic: values.emailSyncAutomatic,
          autoCategorize: values.autoCategorize,
          schedule:
            values.emailSyncScheduleMode === EMAIL_SYNC_SCHEDULE_MODES.INTERVAL
              ? {
                  mode: EMAIL_SYNC_SCHEDULE_MODES.INTERVAL,
                  everyMinutes: Number(values.emailSyncEveryMinutes),
                }
              : {
                  mode: EMAIL_SYNC_SCHEDULE_MODES.TIMES,
                  times: values.emailSyncTimes
                    .split(",")
                    .map((time) => time.trim())
                    .filter(Boolean),
                },
        },
        notifications: {
          budgetAlerts: values.budgetAlerts,
          aiSuggestions: values.aiSuggestions,
          transactionDetected: values.transactionDetected,
          monthlyReport: values.monthlyReport,
          cardDueDate: values.cardDueDate,
          unusualExpense: values.unusualExpense,
        },
      },
      { isEnabled: moduleEnable.pendingEnabled }
    )
    appToast.success({
      text1: "Finanzas actualizadas",
      text2: "La configuración del módulo se guardó.",
    })
    onOpenChange(false)
  })

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Finanzas"
      description={config.fieldGuide}
      actions={{
        close: (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
        ),
        submit: (
          <Button
            disabled={!isDirty || updateMutation.isPending}
            className="flex-1"
            onClick={onSubmit}
          >
            {updateMutation.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : null}
            {updateMutation.isPending ? "Guardando..." : "Guardar"}
          </Button>
        ),
      }}
    >
      <ModuleSheetEnableRow
        state={moduleEnable.state}
        isEnabled={moduleEnable.sheetEnabled}
        onEnabledChange={moduleEnable.handleEnabledChange}
        disabled={updateMutation.isPending}
      />
      <SummarySection title="Moneda base" icon={DollarSign}>
        <Controller
          control={control}
          name="baseCurrency"
          render={({ field }) => (
            <CurrencySelectField
              value={field.value}
              onChange={field.onChange}
              enabled={open}
              extraCodes={[config.baseCurrency]}
              disabled={updateMutation.isPending}
            />
          )}
        />
      </SummarySection>
      <SummarySection title="Inicio de semana" icon={CalendarCog}>
        <RadioGroup
          value={weekStartsOn}
          onValueChange={(v) =>
            setValue("weekStartsOn", v as "0" | "1", { shouldDirty: true })
          }
        >
          {WEEK_OPTIONS.map((option) => (
            <OptionRow
              key={option.value}
              icon={CalendarDays}
              iconColor={MODULE_ACCENT}
              label={option.label}
              description={option.description}
              selected={weekStartsOn === option.value}
              onPress={() =>
                setValue("weekStartsOn", option.value, { shouldDirty: true })
              }
              trailing={<RadioGroupItem value={option.value} />}
            />
          ))}
        </RadioGroup>
      </SummarySection>
      <SummarySection title="Período del panel" icon={ChartBarIcon}>
        <RadioGroup
          value={dashboardPeriod}
          onValueChange={(v) =>
            setValue(
              "dashboardPeriod",
              v as FinanceModuleConfig["dashboardPeriod"],
              {
                shouldDirty: true,
              }
            )
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
              onPress={() =>
                setValue("dashboardPeriod", option.value, { shouldDirty: true })
              }
              trailing={<RadioGroupItem value={option.value} />}
            />
          ))}
        </RadioGroup>
      </SummarySection>
      <SummarySection title="Visualización" icon={ScanEyeIcon}>
        <Controller
          control={control}
          name="showCents"
          render={({ field }) => (
            <SwitchFieldRow
              label="Mostrar centavos"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="compactNumbers"
          render={({ field }) => (
            <SwitchFieldRow
              label="Números compactos"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </SummarySection>
      <SummarySection title="Sincronización de email" icon={Mail}>
        <Controller
          control={control}
          name="emailSyncEnabled"
          render={({ field }) => (
            <SwitchFieldRow
              label="Activar sync"
              description="Permite conectar Gmail y sincronizar a mano."
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="emailSyncAutomatic"
          render={({ field }) => (
            <SwitchFieldRow
              label="Sync automático"
              description="Usa la frecuencia configurada abajo. Si está apagado, solo sincronizas a mano."
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={!emailSyncEnabledWatch}
            />
          )}
        />
        <Controller
          control={control}
          name="emailSyncScheduleMode"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={(value) =>
                setValue(
                  "emailSyncScheduleMode",
                  value as "interval" | "times",
                  { shouldDirty: true }
                )
              }
            >
              <OptionRow
                icon={Clock}
                iconColor={MODULE_ACCENT}
                label="Cada cierto tiempo"
                description="Ej.: cada 30 minutos o cada 6 horas."
                selected={field.value === EMAIL_SYNC_SCHEDULE_MODES.INTERVAL}
                onPress={() =>
                  setValue(
                    "emailSyncScheduleMode",
                    EMAIL_SYNC_SCHEDULE_MODES.INTERVAL,
                    {
                      shouldDirty: true,
                    }
                  )
                }
                trailing={
                  <RadioGroupItem value={EMAIL_SYNC_SCHEDULE_MODES.INTERVAL} />
                }
              />
              <OptionRow
                icon={CalendarClock}
                iconColor={MODULE_ACCENT}
                label="A horas fijas del día"
                description="Se usa tu zona horaria. Ej.: 08:00 y 18:00."
                selected={field.value === EMAIL_SYNC_SCHEDULE_MODES.TIMES}
                onPress={() =>
                  setValue(
                    "emailSyncScheduleMode",
                    EMAIL_SYNC_SCHEDULE_MODES.TIMES,
                    {
                      shouldDirty: true,
                    }
                  )
                }
                trailing={
                  <RadioGroupItem value={EMAIL_SYNC_SCHEDULE_MODES.TIMES} />
                }
              />
            </RadioGroup>
          )}
        />
        {emailSyncScheduleMode === EMAIL_SYNC_SCHEDULE_MODES.INTERVAL ? (
          <Controller
            control={control}
            name="emailSyncEveryMinutes"
            render={({ field, fieldState }) => (
              <FormTextField
                label="Minutos entre revisiones"
                type="number"
                placeholder="360"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                disabled={updateMutation.isPending}
              />
            )}
          />
        ) : (
          <Controller
            control={control}
            name="emailSyncTimes"
            render={({ field, fieldState }) => (
              <FormTextField
                label="Horas del día"
                placeholder="08:00, 18:00"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                disabled={updateMutation.isPending}
              />
            )}
          />
        )}
        <Controller
          control={control}
          name="autoCategorize"
          render={({ field }) => (
            <SwitchFieldRow
              label="Auto-categorizar"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </SummarySection>
      <SummarySection title="Alertas del módulo" icon={Tags}>
        {FINANCE_NOTIFICATION_ROWS.map((row) => (
          <Controller
            key={row.key}
            control={control}
            name={row.key}
            render={({ field }) => (
              <SwitchFieldRow
                label={row.label}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        ))}
      </SummarySection>
    </BottomSheet>
  )
}
