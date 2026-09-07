"use client"

import { CurrencySelectField } from "@/src/modules/finance/components/catalog/currency-select-field";
import { ModuleSheetEnableRow } from "@/src/modules/settings/components/profile-ui";
import { useModuleSheetEnable } from "@/src/modules/settings/hooks/use-module-sheet-enable";
import { useProfileSheetFormSync } from "@/src/modules/settings/hooks/use-profile-sheet";
import { useUserModuleConfig } from "@/src/modules/settings/hooks/use-user-module-config";
import type { FinanceModuleConfig } from "@/src/modules/settings/types/module-config.types";
import type { SettingsSheetProps } from "@/src/modules/settings/types/sheet.types";
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet";
import { OptionRow, SwitchFieldRow } from "@/src/shared/components/layout/form-blocks";
import { Button } from "@/src/shared/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/src/shared/components/ui/radio-group";
import { Spinner } from "@/src/shared/components/ui/spinner";
import { SummarySection } from "@/src/shared/components/ui/summary";
import { getModule } from "@/src/shared/constants/module-registry";
import { appToast } from "@/src/shared/lib/app-toast";
import { createSheetSubmit } from "@/src/shared/lib/sheet-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    BarChart3,
    CalendarCog,
    CalendarDays,
    ChartBarIcon,
    DollarSign,
    Mail,
    ScanEyeIcon,
    Tags,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  baseCurrency: z.string().trim().min(3, "Moneda obligatoria"),
  weekStartsOn: z.enum(["0", "1"]),
  dashboardPeriod: z.enum(["week", "month", "year"]),
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
  const router = useRouter()

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
          autoCategorize: values.autoCategorize,
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
            onClick={() => router.back()}
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
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
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
