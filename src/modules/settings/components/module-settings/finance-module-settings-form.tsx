"use client"

import { ModuleSheetEnableRow } from "@/src/modules/settings/components/profile-ui"
import { useModuleSheetEnable } from "@/src/modules/settings/hooks/use-module-sheet-enable"
import { useProfileSheetFormSync } from "@/src/modules/settings/hooks/use-profile-sheet"
import { useUserModuleConfig } from "@/src/modules/settings/hooks/use-user-module-config"
import type { FinanceModuleConfig } from "@/src/modules/settings/types/module-config.types"
import {
  FormTextField,
  OptionRow,
  SwitchFieldRow,
} from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/src/shared/components/ui/radio-group"
import { SummarySection, SummaryItem } from "@/src/shared/components/ui/summary"
import { getModule } from "@/src/shared/constants/module-registry"
import { useAccounts } from "@/src/modules/finance"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  BarChart3,
  BellRing,
  Calculator,
  CalendarClock,
  CalendarCog,
  CalendarDays,
  CalendarRange,
  ChartBarIcon,
  CheckIcon,
  Clock,
  Coins,
  CreditCard,
  DollarSign,
  FileBarChart,
  HandCoins,
  Keyboard,
  Landmark,
  Mail,
  Receipt,
  RefreshCw,
  Repeat,
  ScanEyeIcon,
  Shrink,
  Sparkles,
  Tags,
  TriangleAlert,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { EmailSyncScheduleFields } from "@/src/modules/settings/components/module-settings/email-sync-schedule-fields"
import {
  EMAIL_SYNC_SCHEDULE_MODES,
  configToFinanceFormValues,
  emailSyncPatchFromFormValues,
  financeModuleSchema,
  parsePayDays,
  type FinanceModuleFormValues,
} from "@/src/modules/settings/lib/finance-module-form"

const MODULE_ACCENT = getModule("finance").accent

const FINANCE_NOTIFICATION_ROWS = [
  { key: "budgetAlerts", label: "Alertas de presupuesto", icon: Wallet },
  { key: "aiSuggestions", label: "Sugerencias de IA", icon: Sparkles },
  {
    key: "transactionDetected",
    label: "Transacciones detectadas",
    icon: Receipt,
  },
  { key: "monthlyReport", label: "Reporte mensual", icon: FileBarChart },
  { key: "weeklySummary", label: "Resumen semanal", icon: CalendarDays },
  { key: "cardDueDate", label: "Vencimiento de tarjetas", icon: CreditCard },
  { key: "unusualExpense", label: "Gastos inusuales", icon: TriangleAlert },
  {
    key: "recurringAlerts",
    label: "Cobros recurrentes",
    icon: Repeat,
  },
] as const satisfies readonly {
  key: keyof FinanceModuleConfig["notifications"]
  label: string
  icon: LucideIcon
}[]

const WEEK_OPTIONS = [
  { value: "1", label: "Lunes", description: "Semana laboral estándar." },
  { value: "0", label: "Domingo", description: "Semana tipo calendario US." },
] as const

const WEEKDAY_OPTIONS = [
  { value: "1", label: "Lunes" },
  { value: "2", label: "Martes" },
  { value: "3", label: "Miércoles" },
  { value: "4", label: "Jueves" },
  { value: "5", label: "Viernes" },
  { value: "6", label: "Sábado" },
  { value: "0", label: "Domingo" },
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

function AccountChoiceList({
  accounts,
  selectedId,
  onSelect,
  noneLabel,
}: {
  accounts: { id: string; name: string; currency: string }[]
  selectedId: string
  onSelect: (accountId: string) => void
  noneLabel: string
}) {
  return (
    <>
      <OptionRow
        icon={Wallet}
        iconColor={MODULE_ACCENT}
        label={noneLabel}
        selected={selectedId === ""}
        onPress={() => onSelect("")}
        trailing={selectedId === "" ? <CheckIcon /> : null}
      />
      {accounts.map((account) => (
        <OptionRow
          key={account.id}
          icon={Landmark}
          iconColor={MODULE_ACCENT}
          label={account.name}
          description={account.currency}
          selected={selectedId === account.id}
          onPress={() => onSelect(account.id)}
          trailing={selectedId === account.id ? <CheckIcon /> : null}
        />
      ))}
      {accounts.length === 0 ? (
        <p className="px-1 text-sm text-muted-foreground">
          No hay cuentas todavía.
        </p>
      ) : null}
    </>
  )
}

export function FinanceModuleSettingsForm({ onDone }: { onDone: () => void }) {
  const { config, updateConfig, updateMutation } =
    useUserModuleConfig("finance")
  const moduleEnable = useModuleSheetEnable("finance")
  const accountsQuery = useAccounts(true)
  const accounts = accountsQuery.data ?? []

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty },
  } = useForm<FinanceModuleFormValues>({
    resolver: zodResolver(financeModuleSchema),
    defaultValues: configToFinanceFormValues(config),
  })

  const weekStartsOn = useWatch({ control, name: "weekStartsOn" })
  const dashboardPeriod = useWatch({ control, name: "dashboardPeriod" })
  const emailSyncEnabledWatch = useWatch({
    control,
    name: "emailSyncEnabled",
  })
  const fixedIncomeEnabledWatch = useWatch({
    control,
    name: "fixedIncomeEnabled",
  })
  const formValues = useMemo(() => configToFinanceFormValues(config), [config])
  useProfileSheetFormSync(true, reset, formValues)

  const syncPendingOnSheetOpen = moduleEnable.syncPendingOnSheetOpen
  useEffect(() => {
    syncPendingOnSheetOpen()
  }, [syncPendingOnSheetOpen])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const onSubmit = submitForm(async (values) => {
    await updateConfig(
      {
        weekStartsOn: Number(values.weekStartsOn) as 0 | 1,
        dashboardPeriod: values.dashboardPeriod,
        display: {
          showCents: values.showCents,
          compactNumbers: values.compactNumbers,
        },
        amountEntry: values.amountEntry,
        defaultAccountId: values.defaultAccountId || null,
        monthStartDay: Number(values.monthStartDay),
        reminders: {
          cardDueDaysBefore: Number(values.cardDueDaysBefore),
        },
        fixedIncome: {
          enabled: values.fixedIncomeEnabled,
          amount: Number(values.fixedIncomeAmount) || 0,
          frequency: values.fixedIncomeFrequency,
          payDays: parsePayDays(values.fixedIncomePayDays),
          accountId: values.fixedIncomeAccountId || null,
        },
        emailSync: emailSyncPatchFromFormValues(values),
        notifications: {
          budgetAlerts: values.budgetAlerts,
          aiSuggestions: values.aiSuggestions,
          transactionDetected: values.transactionDetected,
          monthlyReport: values.monthlyReport,
          weeklySummary: values.weeklySummary,
          cardDueDate: values.cardDueDate,
          unusualExpense: values.unusualExpense,
          recurringAlerts: values.recurringAlerts,
        },
        reports: {
          weeklySummaryDay: Number(values.weeklySummaryDay),
        },
      },
      { isEnabled: moduleEnable.pendingEnabled }
    )
    appToast.success({
      text1: "Finanzas actualizadas",
      text2: "La configuración del módulo se guardó.",
    })
    onDone()
  })

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <ModuleSheetEnableRow
        state={moduleEnable.state}
        isEnabled={moduleEnable.sheetEnabled}
        onEnabledChange={moduleEnable.handleEnabledChange}
        disabled={updateMutation.isPending}
      />
      <SummarySection title="Moneda" icon={DollarSign}>
        <SummaryItem
          href={APP_ROUTES.app.settingsFinanceCurrencies}
          icon={DollarSign}
          accentColor={MODULE_ACCENT}
          title="Moneda principal"
          description="Monedas y tasas del ledger."
          value={config.baseCurrency}
          showChevron
          isLast
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
              icon={Coins}
              iconColor={MODULE_ACCENT}
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
              icon={Shrink}
              iconColor={MODULE_ACCENT}
              label="Números compactos"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </SummarySection>

      <SummarySection title="Ingreso fijo" icon={HandCoins}>
        <Controller
          control={control}
          name="fixedIncomeEnabled"
          render={({ field }) => (
            <SwitchFieldRow
              icon={HandCoins}
              iconColor={MODULE_ACCENT}
              label="Tengo un ingreso fijo"
              description="Se usa como monto sugerido cuando llega una nómina sin cifra."
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="fixedIncomeAmount"
          render={({ field, fieldState }) => (
            <FormTextField
              label="Monto"
              icon={HandCoins}
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              disabled={!fixedIncomeEnabledWatch}
            />
          )}
        />
        <Controller
          control={control}
          name="fixedIncomeFrequency"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={(value) =>
                setValue(
                  "fixedIncomeFrequency",
                  value as "BIWEEKLY" | "MONTHLY",
                  { shouldDirty: true }
                )
              }
            >
              <OptionRow
                icon={CalendarDays}
                iconColor={MODULE_ACCENT}
                label="Quincenal"
                selected={field.value === "BIWEEKLY"}
                onPress={() =>
                  setValue("fixedIncomeFrequency", "BIWEEKLY", {
                    shouldDirty: true,
                  })
                }
                trailing={<RadioGroupItem value="BIWEEKLY" />}
              />
              <OptionRow
                icon={CalendarRange}
                iconColor={MODULE_ACCENT}
                label="Mensual"
                selected={field.value === "MONTHLY"}
                onPress={() =>
                  setValue("fixedIncomeFrequency", "MONTHLY", {
                    shouldDirty: true,
                  })
                }
                trailing={<RadioGroupItem value="MONTHLY" />}
              />
            </RadioGroup>
          )}
        />
        <Controller
          control={control}
          name="fixedIncomePayDays"
          render={({ field, fieldState }) => (
            <FormTextField
              label="Días de pago (ej. 15, 30)"
              icon={CalendarDays}
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              disabled={!fixedIncomeEnabledWatch}
            />
          )}
        />
        <Controller
          control={control}
          name="fixedIncomeAccountId"
          render={({ field }) => (
            <AccountChoiceList
              accounts={accounts}
              selectedId={field.value}
              onSelect={field.onChange}
              noneLabel="Sin cuenta"
            />
          )}
        />
      </SummarySection>

      <SummarySection title="Cuenta por defecto" icon={Landmark}>
        <Controller
          control={control}
          name="defaultAccountId"
          render={({ field }) => (
            <AccountChoiceList
              accounts={accounts}
              selectedId={field.value}
              onSelect={field.onChange}
              noneLabel="Sin cuenta por defecto"
            />
          )}
        />
      </SummarySection>

      <SummarySection title="Entrada de monto" icon={Keyboard}>
        <Controller
          control={control}
          name="amountEntry"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={(value) =>
                setValue("amountEntry", value as "keyboard" | "calculator", {
                  shouldDirty: true,
                })
              }
            >
              <OptionRow
                icon={Keyboard}
                iconColor={MODULE_ACCENT}
                label="Teclado"
                selected={field.value === "keyboard"}
                onPress={() =>
                  setValue("amountEntry", "keyboard", { shouldDirty: true })
                }
                trailing={<RadioGroupItem value="keyboard" />}
              />
              <OptionRow
                icon={Calculator}
                iconColor={MODULE_ACCENT}
                label="Calculadora"
                selected={field.value === "calculator"}
                onPress={() =>
                  setValue("amountEntry", "calculator", { shouldDirty: true })
                }
                trailing={<RadioGroupItem value="calculator" />}
              />
            </RadioGroup>
          )}
        />
      </SummarySection>

      <SummarySection title="Mes financiero" icon={CalendarRange}>
        <Controller
          control={control}
          name="monthStartDay"
          render={({ field, fieldState }) => (
            <FormTextField
              label="Día de inicio (1-28)"
              icon={CalendarRange}
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
      </SummarySection>

      <SummarySection title="Recordatorios" icon={BellRing}>
        <Controller
          control={control}
          name="cardDueDaysBefore"
          render={({ field, fieldState }) => (
            <FormTextField
              label="Días antes del vencimiento de la tarjeta"
              icon={BellRing}
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
      </SummarySection>

      <SummarySection title="Sincronización de correo" icon={Mail}>
        <Controller
          control={control}
          name="emailSyncEnabled"
          render={({ field }) => (
            <SwitchFieldRow
              icon={Mail}
              iconColor={MODULE_ACCENT}
              label="Sincronizar correo"
              description="Conecta Gmail y trae los movimientos del banco."
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
              icon={RefreshCw}
              iconColor={MODULE_ACCENT}
              label="Sincronizar automáticamente"
              description="Busca correos nuevos cada cierto tiempo."
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={!emailSyncEnabledWatch}
            />
          )}
        />
        <Controller
          control={control}
          name="autoCategorize"
          render={({ field }) => (
            <SwitchFieldRow
              icon={Tags}
              iconColor={MODULE_ACCENT}
              label="Asignar categoría automáticamente"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="emailSyncMode"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={(value) =>
                setValue("emailSyncMode", value as "DIRECT" | "PENDING", {
                  shouldDirty: true,
                })
              }
            >
              <OptionRow
                icon={Mail}
                iconColor={MODULE_ACCENT}
                label="Entran confirmados"
                description="Se registran directo en el saldo."
                selected={field.value === "DIRECT"}
                onPress={() =>
                  setValue("emailSyncMode", "DIRECT", { shouldDirty: true })
                }
                trailing={<RadioGroupItem value="DIRECT" />}
              />
              <OptionRow
                icon={Mail}
                iconColor={MODULE_ACCENT}
                label="Entran pendientes"
                description="Los revisas y confirmas después."
                selected={field.value === "PENDING"}
                onPress={() =>
                  setValue("emailSyncMode", "PENDING", { shouldDirty: true })
                }
                trailing={<RadioGroupItem value="PENDING" />}
              />
            </RadioGroup>
          )}
        />
        <SummaryItem
          href={APP_ROUTES.app.financeSync}
          icon={Mail}
          accentColor={MODULE_ACCENT}
          title="Bancos y remitentes"
          description="Elige qué correos leer."
          showChevron
          isLast
        />
      </SummarySection>

      <SummarySection title="Horarios de sincronización" icon={Clock}>
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
                description="Se configura un periodo de tiempo."
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
                description="Se configuran varias horas en el día."
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
        <EmailSyncScheduleFields
          control={control}
          disabled={updateMutation.isPending}
        />
      </SummarySection>

      <SummarySection title="Resumen semanal" icon={CalendarDays}>
        <Controller
          control={control}
          name="weeklySummaryDay"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={(value) =>
                setValue(
                  "weeklySummaryDay",
                  value as "0" | "1" | "2" | "3" | "4" | "5" | "6",
                  { shouldDirty: true }
                )
              }
            >
              {WEEKDAY_OPTIONS.map((option) => (
                <OptionRow
                  key={option.value}
                  icon={CalendarDays}
                  iconColor={MODULE_ACCENT}
                  label={option.label}
                  selected={field.value === option.value}
                  onPress={() =>
                    setValue("weeklySummaryDay", option.value, {
                      shouldDirty: true,
                    })
                  }
                  trailing={<RadioGroupItem value={option.value} />}
                />
              ))}
            </RadioGroup>
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
                icon={row.icon}
                iconColor={MODULE_ACCENT}
                label={row.label}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        ))}
      </SummarySection>

      <Button
        type="submit"
        className="h-11 w-full"
        disabled={
          !(isDirty || moduleEnable.isEnabledDirty) || updateMutation.isPending
        }
      >
        {updateMutation.isPending ? <Spinner data-icon="inline-start" /> : null}
        {updateMutation.isPending ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  )
}
