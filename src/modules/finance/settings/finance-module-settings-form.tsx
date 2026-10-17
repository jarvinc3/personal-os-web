"use client"

import { ModuleSheetEnableRow } from "@/src/modules/settings/components/profile-ui"
import { useModuleSheetEnable } from "@/src/modules/settings/hooks/use-module-sheet-enable"
import { useProfileSheetFormSync } from "@/src/modules/settings/hooks/use-profile-sheet"
import { useUserModuleConfig } from "@/src/modules/settings/hooks/use-user-module-config"
import type { FinanceModuleConfig } from "@/src/modules/settings/types/module-config.types"
import {
  OptionRow,
  SwitchFieldRow,
} from "@/src/shared/components/layout/form-blocks"
import { ChoiceGrid } from "@/src/shared/components/ui/choice-grid"
import { DayListField } from "@/src/shared/components/ui/day-list-field"
import { DayWheel } from "@/src/shared/components/ui/wheel-picker"
import { FormScreen } from "@/src/shared/components/forms/form-screen"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/src/shared/components/ui/radio-group"
import {
  SummaryGroup,
  SummaryItem,
  SummarySection,
} from "@/src/shared/components/ui/summary"
import { getModule } from "@/src/shared/constants/module-registry"
import { FinanceIntegritySettingsSection } from "@/src/modules/finance/integrity"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  BellRing,
  Calculator,
  Calendar,
  CalendarClock,
  CalendarCog,
  CalendarDays,
  CalendarRange,
  ChartBarIcon,
  Clock,
  Coins,
  CreditCard,
  DollarSign,
  FileBarChart,
  HandCoins,
  Keyboard,
  Landmark,
  List,
  Mail,
  Receipt,
  RefreshCw,
  Repeat,
  SaveIcon,
  ScanEyeIcon,
  Shrink,
  SlidersHorizontal,
  Sparkles,
  Store,
  Sun,
  Tags,
  TriangleAlert,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm, useWatch, type Control } from "react-hook-form"
import { EmailSyncScheduleFields } from "./email-sync-schedule-fields"
import {
  EMAIL_SYNC_SCHEDULE_MODES,
  configToFinanceFormValues,
  emailSyncPatchFromFormValues,
  financeModuleSchema,
  parsePayDays,
  subscriptionsPatchFromFormValues,
  type FinanceModuleFormValues,
} from "./lib/finance-module-form"

const MODULE_ACCENT = getModule("finance").accent

const NOTIFICATION_GROUPS = [
  {
    title: "Movimientos",
    rows: [
      {
        key: "transactionDetected",
        label: "Transacciones detectadas",
        icon: Receipt,
      },
      { key: "unusualExpense", label: "Gastos inusuales", icon: TriangleAlert },
      { key: "budgetAlerts", label: "Alertas de presupuesto", icon: Wallet },
    ],
  },
  {
    title: "Reportes",
    rows: [
      { key: "monthlyReport", label: "Reporte mensual", icon: FileBarChart },
      { key: "weeklySummary", label: "Resumen semanal", icon: CalendarDays },
    ],
  },
  {
    title: "Tarjetas",
    rows: [
      {
        key: "cardDueDate",
        label: "Vencimiento de tarjetas",
        icon: CreditCard,
      },
    ],
  },
  {
    title: "Cobros y suscripciones",
    rows: [
      { key: "recurringAlerts", label: "Cobros recurrentes", icon: Repeat },
      {
        key: "subscriptionReminders",
        label: "Renovación de suscripciones",
        icon: Repeat,
      },
      {
        key: "priceIncreaseAlerts",
        label: "Subidas de precio",
        icon: TriangleAlert,
      },
    ],
  },
  {
    title: "IA y saldos",
    rows: [
      { key: "aiSuggestions", label: "Sugerencias de IA", icon: Sparkles },
      { key: "balanceIntegrity", label: "Saldos descuadrados", icon: Coins },
    ],
  },
] as const satisfies readonly {
  title: string
  rows: readonly {
    key: keyof FinanceModuleConfig["notifications"]
    label: string
    icon: LucideIcon
  }[]
}[]

const WEEK_OPTIONS = [
  { value: "1", label: "Lunes", icon: CalendarDays },
  { value: "0", label: "Domingo", icon: Sun },
] as const

/** Days of warning the user can pick without the wheel. */
const REMINDER_DAY_PRESETS = [
  { value: "3", label: "3 días", icon: BellRing },
  { value: "5", label: "5 días", icon: BellRing },
  { value: "7", label: "7 días", icon: BellRing },
  { value: "10", label: "10 días", icon: BellRing },
] as const

const WEEKDAY_OPTIONS = [
  { value: "1", label: "Lunes", short: "Lun" },
  { value: "2", label: "Martes", short: "Mar" },
  { value: "3", label: "Miércoles", short: "Mié" },
  { value: "4", label: "Jueves", short: "Jue" },
  { value: "5", label: "Viernes", short: "Vie" },
  { value: "6", label: "Sábado", short: "Sáb" },
  { value: "0", label: "Domingo", short: "Dom" },
] as const

const PERIOD_OPTIONS = [
  { value: "week", label: "Semana", icon: CalendarDays },
  { value: "month", label: "Mes", icon: CalendarRange },
  { value: "year", label: "Año", icon: Calendar },
] as const satisfies readonly {
  value: FinanceModuleConfig["dashboardPeriod"]
  label: string
  icon: LucideIcon
}[]

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
        accentColor={MODULE_ACCENT}
        label={noneLabel}
        selected={selectedId === ""}
        onPress={() => onSelect("")}
      />
      {accounts.map((account) => (
        <OptionRow
          key={account.id}
          icon={Landmark}
          iconColor={MODULE_ACCENT}
          accentColor={MODULE_ACCENT}
          label={account.name}
          description={account.currency}
          selected={selectedId === account.id}
          onPress={() => onSelect(account.id)}
        />
      ))}
      {accounts.length === 0 ? (
        <p className="px-2 text-sm text-muted-foreground">
          No hay cuentas todavía.
        </p>
      ) : null}
    </>
  )
}

const WEEKDAY_CHOICES = WEEKDAY_OPTIONS.map((option) => ({
  value: option.value,
  label: option.short,
  icon: CalendarDays,
}))

function WeeklySummaryDayField({
  control,
}: {
  control: Control<FinanceModuleFormValues>
}) {
  return (
    <Controller
      control={control}
      name="weeklySummaryDay"
      render={({ field }) => (
        <ChoiceGrid
          ariaLabel="Día del resumen semanal"
          accentColor={MODULE_ACCENT}
          columns={7}
          value={field.value}
          onValueChange={field.onChange}
          options={WEEKDAY_CHOICES}
        />
      )}
    />
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
  const emailSyncAutomaticWatch = useWatch({
    control,
    name: "emailSyncAutomatic",
  })
  const fixedIncomeEnabledWatch = useWatch({
    control,
    name: "fixedIncomeEnabled",
  })
  const weeklySummaryWatch = useWatch({ control, name: "weeklySummary" })
  const cardDueDateWatch = useWatch({ control, name: "cardDueDate" })
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
        subscriptions: subscriptionsPatchFromFormValues(values),
        notifications: {
          budgetAlerts: values.budgetAlerts,
          aiSuggestions: values.aiSuggestions,
          transactionDetected: values.transactionDetected,
          monthlyReport: values.monthlyReport,
          weeklySummary: values.weeklySummary,
          cardDueDate: values.cardDueDate,
          unusualExpense: values.unusualExpense,
          recurringAlerts: values.recurringAlerts,
          subscriptionReminders: values.subscriptionReminders,
          priceIncreaseAlerts: values.priceIncreaseAlerts,
          balanceIntegrity: values.balanceIntegrity,
        },
        reports: {
          weeklySummaryDay: Number(values.weeklySummaryDay),
        },
      },
      { isEnabled: moduleEnable.pendingEnabled }
    )
    appToast.success({
      text1: "Finanzas actualizadas",
      text2: "La configuración de la app se guardó.",
    })
    onDone()
  })

  return (
    <FormScreen
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
      submitLabel="Guardar"
      submitIcon={SaveIcon}
      isSubmitting={updateMutation.isPending}
      submitDisabled={
        !(isDirty || moduleEnable.isEnabledDirty) || updateMutation.isPending
      }
    >
      <ModuleSheetEnableRow
        state={moduleEnable.state}
        accentColor={MODULE_ACCENT}
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
        <SummaryGroup title="Primer día de la semana">
          <ChoiceGrid
            ariaLabel="Primer día de la semana"
            accentColor={MODULE_ACCENT}
            value={weekStartsOn}
            onValueChange={(value) =>
              setValue("weekStartsOn", value, { shouldDirty: true })
            }
            options={WEEK_OPTIONS}
          />
        </SummaryGroup>
      </SummarySection>

      <SummarySection title="Período del panel" icon={ChartBarIcon}>
        <SummaryGroup title="Vista por defecto">
          <ChoiceGrid
            ariaLabel="Vista por defecto"
            accentColor={MODULE_ACCENT}
            value={dashboardPeriod}
            onValueChange={(value) =>
              setValue("dashboardPeriod", value, { shouldDirty: true })
            }
            options={PERIOD_OPTIONS}
          />
        </SummaryGroup>
      </SummarySection>

      <SummarySection title="Visualización" icon={ScanEyeIcon}>
        <SummaryGroup title="Formato de las cantidades">
          <Controller
            control={control}
            name="showCents"
            render={({ field }) => (
              <SwitchFieldRow
                icon={Coins}
                iconColor={MODULE_ACCENT}
                accentColor={MODULE_ACCENT}
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
                accentColor={MODULE_ACCENT}
                label="Números compactos"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </SummaryGroup>
      </SummarySection>

      <SummarySection title="Ingreso fijo" icon={HandCoins}>
        <Controller
          control={control}
          name="fixedIncomeEnabled"
          render={({ field }) => (
            <SwitchFieldRow
              icon={HandCoins}
              iconColor={MODULE_ACCENT}
              accentColor={MODULE_ACCENT}
              label="Tengo un ingreso fijo"
              description="Se usa como monto sugerido cuando llega una nómina sin cifra."
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        {fixedIncomeEnabledWatch ? (
          <>
            <Controller
              control={control}
              name="fixedIncomeAmount"
              render={({ field, fieldState }) => (
                <FinanceMoneyField
                  label="Monto"
                  amount={field.value}
                  onAmountChange={field.onChange}
                  onAmountCommit={field.onChange}
                  onAmountBlur={field.onBlur}
                  amountError={fieldState.error?.message}
                  currency={config.baseCurrency}
                />
              )}
            />

            <SummaryGroup title="Frecuencia del ingreso">
              <Controller
                control={control}
                name="fixedIncomeFrequency"
                render={({ field }) => (
                  <ChoiceGrid
                    ariaLabel="Frecuencia del ingreso"
                    accentColor={MODULE_ACCENT}
                    value={field.value}
                    onValueChange={field.onChange}
                    options={[
                      {
                        value: "BIWEEKLY",
                        label: "Quincenal",
                        icon: CalendarDays,
                      },
                      {
                        value: "MONTHLY",
                        label: "Mensual",
                        icon: CalendarRange,
                      },
                    ]}
                  />
                )}
              />
            </SummaryGroup>

            <Controller
              control={control}
              name="fixedIncomePayDays"
              render={({ field, fieldState }) => (
                <DayListField
                  label="Días de pago"
                  icon={CalendarDays}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />

            <SummaryGroup title="Cuenta asignada al ingreso por defecto">
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
            </SummaryGroup>
          </>
        ) : null}
      </SummarySection>

      <SummarySection title="Cuenta por defecto" icon={Landmark}>
        <SummaryGroup title="Cuenta de los movimientos nuevos">
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
        </SummaryGroup>
      </SummarySection>

      <SummarySection title="Entrada de monto" icon={Keyboard}>
        <SummaryGroup title="Forma de capturar el monto">
          <Controller
            control={control}
            name="amountEntry"
            render={({ field }) => (
              <ChoiceGrid
                accentColor={MODULE_ACCENT}
                ariaLabel="Forma de capturar el monto"
                value={field.value}
                onValueChange={field.onChange}
                options={[
                  { value: "keyboard", label: "Teclado", icon: Keyboard },
                  {
                    value: "calculator",
                    label: "Calculadora",
                    icon: Calculator,
                  },
                ]}
              />
            )}
          />
        </SummaryGroup>
      </SummarySection>

      <SummarySection title="Mes financiero" icon={CalendarRange}>
        <SummaryGroup title="Inicio del mes financiero">
          <Controller
            control={control}
            name="monthStartDay"
            render={({ field, fieldState }) => (
              <DayWheel
                icon={CalendarRange}
                value={field.value}
                min={1}
                max={28}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </SummaryGroup>
      </SummarySection>

      <SummarySection title="Suscripciones" icon={Repeat}>
        <SummaryGroup title="Aviso de próximos cobros">
          <Controller
            control={control}
            name="subscriptionReminderDays"
            render={({ field, fieldState }) => {
              const isPreset = REMINDER_DAY_PRESETS.some(
                (option) => option.value === field.value
              )
              return (
                <>
                  <ChoiceGrid
                    ariaLabel="Aviso de próximos cobros"
                    accentColor={MODULE_ACCENT}
                    value={isPreset ? field.value : "custom"}
                    onValueChange={(value) => {
                      if (value === "custom") {
                        field.onChange(isPreset ? "1" : field.value)
                        return
                      }
                      field.onChange(value)
                    }}
                    options={[
                      ...REMINDER_DAY_PRESETS,
                      {
                        value: "custom",
                        label: "Otro",
                        icon: SlidersHorizontal,
                      },
                    ]}
                    error={isPreset ? fieldState.error?.message : undefined}
                  />
                  {!isPreset ? (
                    <DayWheel
                      label="Días antes del cobro"
                      icon={BellRing}
                      value={field.value}
                      min={1}
                      max={30}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                    />
                  ) : null}
                </>
              )
            }}
          />
        </SummaryGroup>
        <SummaryGroup title="Agrupación de la lista">
          <Controller
            control={control}
            name="subscriptionGroupBy"
            render={({ field }) => (
              <ChoiceGrid
                ariaLabel="Agrupación de la lista"
                accentColor={MODULE_ACCENT}
                value={field.value}
                onValueChange={field.onChange}
                options={[
                  { value: "none", label: "Ninguna", icon: List },
                  { value: "category", label: "Categoría", icon: Tags },
                  { value: "provider", label: "Proveedor", icon: Store },
                ]}
              />
            )}
          />
        </SummaryGroup>
      </SummarySection>

      <SummarySection title="Sincronización de correo" icon={Mail}>
        <Controller
          control={control}
          name="emailSyncEnabled"
          render={({ field }) => (
            <SwitchFieldRow
              icon={Mail}
              iconColor={MODULE_ACCENT}
              accentColor={MODULE_ACCENT}
              label="Sincronizar correo"
              description="Conecta Gmail y trae los movimientos del banco."
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        {emailSyncEnabledWatch ? (
          <>
            <SummaryGroup title="Sincronización automática">
              <Controller
                control={control}
                name="emailSyncAutomatic"
                render={({ field }) => (
                  <SwitchFieldRow
                    icon={RefreshCw}
                    iconColor={MODULE_ACCENT}
                    accentColor={MODULE_ACCENT}
                    label="Sincronizar automáticamente"
                    description="Busca correos nuevos cada cierto tiempo."
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
                    icon={Tags}
                    iconColor={MODULE_ACCENT}
                    accentColor={MODULE_ACCENT}
                    label="Asignar categoría automáticamente"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </SummaryGroup>
            <SummaryGroup title="Cómo entran los movimientos">
              <Controller
                control={control}
                name="emailSyncMode"
                render={({ field }) => (
                  <RadioGroup
                    aria-label="Cómo entran los movimientos"
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
                      accentColor={MODULE_ACCENT}
                      label="Entran confirmados"
                      description="Se registran directo en el saldo."
                      selected={field.value === "DIRECT"}
                      onPress={() =>
                        setValue("emailSyncMode", "DIRECT", {
                          shouldDirty: true,
                        })
                      }
                      trailing={<RadioGroupItem value="DIRECT" />}
                    />
                    <OptionRow
                      icon={Mail}
                      iconColor={MODULE_ACCENT}
                      accentColor={MODULE_ACCENT}
                      label="Entran pendientes"
                      description="Los revisas y confirmas después."
                      selected={field.value === "PENDING"}
                      onPress={() =>
                        setValue("emailSyncMode", "PENDING", {
                          shouldDirty: true,
                        })
                      }
                      trailing={<RadioGroupItem value="PENDING" />}
                    />
                  </RadioGroup>
                )}
              />
            </SummaryGroup>
            <SummaryItem
              href={APP_ROUTES.app.financeSync}
              icon={Mail}
              accentColor={MODULE_ACCENT}
              title="Bancos y remitentes"
              description="Elige qué correos leer."
              showChevron
              isLast
            />
          </>
        ) : null}
      </SummarySection>

      {emailSyncEnabledWatch && emailSyncAutomaticWatch ? (
        <SummarySection title="Horarios de sincronización" icon={Clock}>
          <SummaryGroup title="Modo de horario">
            <Controller
              control={control}
              name="emailSyncScheduleMode"
              render={({ field }) => (
                <RadioGroup
                  aria-label="Modo de horario"
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
                    accentColor={MODULE_ACCENT}
                    label="Cada cierto tiempo"
                    description="Se configura un periodo de tiempo."
                    selected={
                      field.value === EMAIL_SYNC_SCHEDULE_MODES.INTERVAL
                    }
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
                      <RadioGroupItem
                        value={EMAIL_SYNC_SCHEDULE_MODES.INTERVAL}
                      />
                    }
                  />
                  <OptionRow
                    icon={CalendarClock}
                    iconColor={MODULE_ACCENT}
                    accentColor={MODULE_ACCENT}
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
          </SummaryGroup>
        </SummarySection>
      ) : null}

      <SummarySection title="Alertas de la app" icon={Tags}>
        {NOTIFICATION_GROUPS.map((group) => (
          <SummaryGroup key={group.title} title={group.title}>
            {group.rows.map((row) => (
              <Controller
                key={row.key}
                control={control}
                name={row.key}
                render={({ field }) => (
                  <SwitchFieldRow
                    icon={row.icon}
                    iconColor={MODULE_ACCENT}
                    accentColor={MODULE_ACCENT}
                    label={row.label}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            ))}
            {group.title === "Reportes" && weeklySummaryWatch ? (
              <SummaryGroup title="Día del resumen semanal">
                <WeeklySummaryDayField control={control} />
              </SummaryGroup>
            ) : null}
            {group.title === "Tarjetas" && cardDueDateWatch ? (
              <Controller
                control={control}
                name="cardDueDaysBefore"
                render={({ field, fieldState }) => (
                  <DayWheel
                    label="Días antes del vencimiento"
                    icon={BellRing}
                    value={field.value}
                    min={0}
                    max={30}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />
            ) : null}
          </SummaryGroup>
        ))}
      </SummarySection>

      <FinanceIntegritySettingsSection
        enabled
        display={{
          currency: config.baseCurrency,
          showCents: config.display.showCents,
          compactNumbers: config.display.compactNumbers,
        }}
      />
    </FormScreen>
  )
}
